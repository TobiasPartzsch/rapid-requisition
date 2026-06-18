import { EQUIPMENT_CATALOG } from "./catalog.js";
import { canPlaceItem, getEffectiveDimensions, initializeInventory, rotateItem } from "./inventory.js";
import { GameState, LootItem, PocketState } from "./types.js";
import { renderInventory } from "./view/inventoryRenderer.js";
import { createItemElement, updatePreviewPosition } from "./view/itemRenderer.js";

console.log("Starting Rapid Requisition")

const inventoryContainer = document.getElementById("inventory-view");

const queueContainer = document.getElementById("loot-queue");

if (queueContainer) {
    // Generate a few items as requested
    const items = [
        { id: "i1", size: { width: 2, height: 1 }, color: "#ff4444", rotated: false },
        { id: "i2", size: { width: 1, height: 2 }, color: "#44ff44", rotated: false },
        { id: "i3", size: { width: 2, height: 2 }, color: "#2200ff", rotated: false },
        { id: "i4", size: { width: 3, height: 2 }, color: "#4444ff", rotated: false },
        { id: "i5", size: { width: 2, height: 3 }, color: "#442222", rotated: false },
    ];

    items.forEach(item => addLootToQueue(item, queueContainer));
}

let lastMouseX = 0;
let lastMouseY = 0;

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
    heldItem: null
};

if (inventoryContainer) {
    renderInventory(gameState.inventory, inventoryContainer, handleCellClick);
}

const previewEl = document.getElementById("held-item-preview")!;

function updateHeldItemVisuals() {
    if (gameState.heldItem) {
        previewEl.innerHTML = "";
        const itemEl = createItemElement(gameState.heldItem);
        previewEl.appendChild(itemEl);
        previewEl.style.display = "block";
        document.body.style.cursor = "none"; // Hide standard cursor
    } else {
        previewEl.style.display = "none";
        document.body.style.cursor = "default"; // Restore cursor
    }
}

window.addEventListener("wheel", (_e) => {
    if (gameState.heldItem) {
        gameState.heldItem = rotateItem(gameState.heldItem);
        updateHeldItemVisuals();
        // Force immediate position update after rotation
        const dims = getEffectiveDimensions(gameState.heldItem);
        updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
    }
});

window.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (gameState.heldItem) {
        const dims = getEffectiveDimensions(gameState.heldItem);
        updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
    }
});

window.addEventListener("contextmenu", (e) => {
    if (gameState.heldItem) {
        e.preventDefault(); // Stop the context menu

        // Return to queue (we'll need a way to re-add it)
        const itemToReturn = gameState.heldItem;
        gameState.heldItem = null;
        updateHeldItemVisuals();

        // Re-render in the queue
        const queueContainer = document.getElementById("loot-queue");
        if (queueContainer) {
            addLootToQueue(itemToReturn, queueContainer);
        }
    }
});

function addLootToQueue(item: LootItem, container: HTMLElement) {
    const itemEl = createItemElement(item);
    itemEl.addEventListener("click", () => {
        if (!gameState.heldItem) {
            handlePickup(item);
            itemEl.remove();
        }
    });
    container.appendChild(itemEl);
}

function handlePickup(item: LootItem) {
    gameState.heldItem = item;
    updateHeldItemVisuals();
    const dims = getEffectiveDimensions(item);
    updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
}

function handleCellClick(pocket: PocketState, x: number, y: number) {
    if (gameState.heldItem) {
        // try to drop
        if (canPlaceItem(gameState.heldItem, pocket, x, y)) {
            const placement = {
                item: gameState.heldItem,
                originX: x,
                originY: y,
            };
            pocket.placedItems = [...pocket.placedItems, placement];
            gameState.heldItem = null;
            updateHeldItemVisuals();
            renderInventory(gameState.inventory, inventoryContainer!, handleCellClick);
        }
    } else {
        // try to lift existing item
        const itemIndex = pocket.placedItems.findIndex(p => {
            const dims = getEffectiveDimensions(p.item);
            return x >= p.originX && x < p.originX + dims.width &&
                y >= p.originY && y < p.originY + dims.height;
        });

        if (itemIndex !== -1) {
            const removedPlacement = pocket.placedItems[itemIndex];

            // 1. Remove it from the grid (it's gone from the vest)
            pocket.placedItems = [
                ...pocket.placedItems.slice(0, itemIndex),
                ...pocket.placedItems.slice(itemIndex + 1)
            ];

            // 2. Put it in the hand (it now follows the cursor)
            // The handlePickup function sets gameState.heldItem and hides the cursor
            handlePickup(removedPlacement.item);

            // 3. Refresh the view so the pocket looks empty again
            renderInventory(gameState.inventory, inventoryContainer!, handleCellClick);
        }
    }
}