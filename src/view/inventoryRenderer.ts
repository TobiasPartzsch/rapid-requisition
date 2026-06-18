import { getEffectiveDimensions } from "../inventory.js";
import { InventoryState, PocketState } from "../types.js";

type OnCellClick = (pocket: PocketState, x: number, y: number) => void;

export function renderInventory(
    state: InventoryState,
    container: HTMLElement,
    onCellClick: OnCellClick,
): void {
    container.innerHTML = "";
    state.pockets.forEach(pocket => {
        const pocketElement = createPocketElement(pocket, onCellClick);
        container.appendChild(pocketElement);
    });
}


function createPocketElement(pocket: PocketState, onCellClick: OnCellClick): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("pocket-grid");
    el.style.position = "relative"; // Ensure children position correctly
    el.style.setProperty("--cols", pocket.definition.dimensions.width.toString());
    el.style.setProperty("--rows", pocket.definition.dimensions.height.toString());

    // Render existing items
    pocket.placedItems.forEach(placement => {
        const itemEl = document.createElement("div");
        itemEl.classList.add("placed-item");
        itemEl.style.position = "absolute"; // Critical!

        const dims = getEffectiveDimensions(placement.item);

        itemEl.style.left = `${placement.originX * 32}px`;
        itemEl.style.top = `${placement.originY * 32}px`;
        itemEl.style.width = `${dims.width * 30 + (dims.width - 1) * 2}px`;
        itemEl.style.height = `${dims.height * 30 + (dims.height - 1) * 2}px`;
        itemEl.style.backgroundColor = placement.item.color;

        el.appendChild(itemEl);
    });

    el.addEventListener("click", (e) => {
        const rect = el.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 32); // 30px + 2px gap
        const y = Math.floor((e.clientY - rect.top) / 32);
        onCellClick(pocket, x, y);
    });

    return el;
}