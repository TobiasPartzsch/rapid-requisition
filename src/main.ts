import { EQUIPMENT_CATALOG } from "./catalog.js";
import { generateLootForInventory } from "./generator.js";
import { canPlaceItem, getEffectiveDimensions, initializeInventory, rotateItem } from "./inventory.js";
import { GameState, LootItem, PocketState } from "./types.js";
import { renderInventory } from "./view/inventoryRenderer.js";
import { createItemElement, updatePreviewPosition } from "./view/itemRenderer.js";

console.log("Starting Rapid Requisition")

const inventoryContainer = document.getElementById("inventory-view")!;
const startButton = document.getElementById("btn-start");
const queueContainer = document.getElementById("loot-queue")!;

const INITIAL_QUEUE_SIZE = 5;

// Generate a few items as requested
const items = [
    { id: "i1", size: { width: 2, height: 1 }, color: "#ff4444", rotated: false },
    { id: "i2", size: { width: 1, height: 2 }, color: "#44ff44", rotated: false },
    { id: "i3", size: { width: 2, height: 2 }, color: "#2200ff", rotated: false },
    { id: "i4", size: { width: 3, height: 2 }, color: "#4444ff", rotated: false },
    { id: "i5", size: { width: 2, height: 3 }, color: "#442222", rotated: false },
];

// items.forEach(item => addLootToQueue(item, queueContainer));

let lastMouseX = 0;
let lastMouseY = 0;

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
    heldItem: null,
    lootQueue: [],
};

function syncUI() {
    // Sync Queue
    queueContainer.innerHTML = "";
    gameState.lootQueue.forEach(item => {
        const itemEl = createItemElement(item);
        itemEl.addEventListener("click", () => handleQueueClick(item));
        queueContainer.appendChild(itemEl);
    });

    // Sync Inventory
    renderInventory(gameState.inventory, inventoryContainer, handleCellClick);

    // Sync Held Item (The "Mouse Ghost")
    if (gameState.heldItem) {
        previewEl.innerHTML = "";
        previewEl.appendChild(createItemElement(gameState.heldItem));
        previewEl.style.display = "block";
        document.body.style.cursor = "none";

        const dims = getEffectiveDimensions(gameState.heldItem);
        updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
    } else {
        previewEl.style.display = "none";
        document.body.style.cursor = "default";
    }
}

function handleQueueClick(item: LootItem) {
    if (gameState.heldItem) return;

    // Update State
    gameState.heldItem = item;
    gameState.lootQueue = gameState.lootQueue.filter(i => i.id !== item.id);

    syncUI();
}

function startMission() {
    const equipment = EQUIPMENT_CATALOG.TACTICAL_VEST;

    gameState = {
        inventory: initializeInventory(equipment),
        heldItem: null,
        lootQueue: Array.from({ length: INITIAL_QUEUE_SIZE }, () =>
            generateLootForInventory(gameState.inventory)
        )
    };

    syncUI();
}

renderInventory(gameState.inventory, inventoryContainer, handleCellClick);

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
        syncUI();
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

        gameState.lootQueue = [...gameState.lootQueue, gameState.heldItem];
        gameState.heldItem = null;
        syncUI();
    }
});

startButton?.addEventListener("click", () => {
    startMission();
});

// function addLootToQueue(item: LootItem, container: HTMLElement) {
//     const itemEl = createItemElement(item);
//     itemEl.addEventListener("click", () => {
//         if (!gameState.heldItem) {
//             handlePickup(item);
//             itemEl.remove();
//         }
//     });
//     container.appendChild(itemEl);
// }

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
            syncUI();
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

            syncUI();
        }
    }
}

// function startMission() {
//     // 1. Reset Inventory State
//     // We fetch the clean definition from the catalog to reset pockets
//     const equipment = EQUIPMENT_CATALOG[gameState.inventory.equipmentId];

//     const resetPockets = equipment.pockets.map(pocketDef => ({
//         definition: pocketDef,
//         placedItems: [] // Clear the hoard!
//     }));

//     // 2. Generate New Queue
//     const newQueue = Array.from({ length: INITIAL_QUEUE_SIZE }, () =>
//         generateLootForInventory(gameState.inventory)
//     );

//     // 3. Update Global State
//     gameState = {
//         ...gameState,
//         inventory: {
//             ...gameState.inventory,
//             pockets: resetPockets
//         },
//         lootQueue: newQueue,
//         heldItem: null // Don't let them carry items between missions
//     };

//     // 4. Trigger Re-render
//     refreshUI();
// }

// function refreshUI() {
//     queueContainer.innerHTML = "";

//     // Instead of manual DOM manipulation here, we use the data
//     gameState.lootQueue.forEach(item => {
//         // This is where you'd call your itemRenderer
//         const element = createItemElement(item);
//         queueContainer.appendChild(element);
//     });

//     renderInventory(gameState.inventory, inventoryContainer, handleCellClick);
// }