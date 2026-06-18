import { EQUIPMENT_CATALOG } from "./catalog.js";
import { canPlaceItem, getEffectiveDimensions, initializeInventory, rotateItem } from "./inventory.js";
import { GameState, LootItem, PocketState } from "./types.js";
import { renderInventory } from "./view/inventoryRenderer.js";
import { createItemElement, updatePreviewPosition } from "./view/itemRenderer.js";

console.log("Starting Rapid Requisition")

const inventoryContainer = document.getElementById("inventory-view");

if (inventoryContainer) {
    const vestBlueprint = EQUIPMENT_CATALOG.TACTICAL_VEST;
    const currentInventory = initializeInventory(vestBlueprint);

    renderInventory(currentInventory, inventoryContainer, handleCellClick);
}

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

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
    heldItem: null
};
let lastMouseX = 0;
let lastMouseY = 0;


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
    if (gameState.heldItem && canPlaceItem(gameState.heldItem, pocket, x, y)) {
        // Successful Requisition!
        const placement = {
            itemId: gameState.heldItem.id,
            originX: x,
            originY: y,
            dimensions: getEffectiveDimensions(gameState.heldItem)
        };

        // Mutation: In a real app we might use a more functional approach,
        // but for the prototype, we update the reference
        (pocket.placedItems as any[]).push(placement);

        gameState.heldItem = null;
        updateHeldItemVisuals();
        renderInventory(gameState.inventory, inventoryContainer!, handleCellClick);
    }
}