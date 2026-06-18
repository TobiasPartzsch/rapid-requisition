import { EQUIPMENT_CATALOG } from "./catalog.js";
import { initializeInventory } from "./inventory.js";
import { renderInventory } from "./view/inventoryRenderer.js";
import { createItemElement } from "./view/itemRenderer.js";

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
        queueContainer.appendChild(createItemElement(item));
    });
}