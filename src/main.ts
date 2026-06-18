import { EQUIPMENT_CATALOG } from "./catalog.js";
import { getEffectiveDimensions, initializeInventory } from "./inventory.js";
import { GameState, LootItem } from "./types.js";
import { renderInventory } from "./view/inventoryRenderer.js";
import { createItemElement, updatePreviewPosition } from "./view/itemRenderer.js";

console.log("Starting Rapid Requisition")

const inventoryContainer = document.getElementById("inventory-view");

if (inventoryContainer) {
    const vestBlueprint = EQUIPMENT_CATALOG.TACTICAL_VEST;
    const currentInventory = initializeInventory(vestBlueprint);

    renderInventory(currentInventory, inventoryContainer);
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

    items.forEach(item => {
        const itemEl = createItemElement(item);
        itemEl.addEventListener("click", () => {
            if (!gameState.heldItem) {
                handlePickup(item);
                itemEl.remove(); // Remove from queue when "in hand"
            }
        });
        queueContainer.appendChild(itemEl);
    });
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

window.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (gameState.heldItem) {
        const dims = getEffectiveDimensions(gameState.heldItem);
        updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
    }
});

function handlePickup(item: LootItem) {
    gameState.heldItem = item;
    updateHeldItemVisuals();
    const dims = getEffectiveDimensions(item);
    updatePreviewPosition(previewEl, lastMouseX, lastMouseY, dims);
}