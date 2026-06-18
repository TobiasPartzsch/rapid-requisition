import { EQUIPMENT_CATALOG } from "./catalog.js";
import { initializeInventory } from "./inventory.js";
import { renderInventory } from "./view/inventoryRenderer.js";

console.log("Starting Rapid Requisition")

const inventoryContainer = document.getElementById("inventory-view");

if (inventoryContainer) {
    const vestBlueprint = EQUIPMENT_CATALOG.TACTICAL_VEST;
    const currentInventory = initializeInventory(vestBlueprint);

    renderInventory(currentInventory, inventoryContainer);
}