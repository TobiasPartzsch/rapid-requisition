import { InventoryState, PocketState } from "../types";

export function renderInventory(state: InventoryState, container: HTMLElement): void {
    container.innerHTML = ""; // Clear existing view

    state.pockets.forEach(pocket => {
        const pocketElement = createPocketElement(pocket);
        container.appendChild(pocketElement);
    });
}

function createPocketElement(pocket: PocketState): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("pocket-grid");

    // Using CSS variables to avoid magic numbers in CSS
    el.style.setProperty("--cols", pocket.definition.dimensions.width.toString());
    el.style.setProperty("--rows", pocket.definition.dimensions.height.toString());

    // TODO: Render placed items inside this pocket

    return el;
}