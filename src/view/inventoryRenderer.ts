import { InventoryState, PocketState } from "../types";

export function renderInventory(state: InventoryState, container: HTMLElement): void {
    container.innerHTML = ""; // Clear existing view

    state.pockets.forEach(pocket => {
        const pocketElement = createPocketElement(pocket);
        container.appendChild(pocketElement);
    });
}

function createPocketElement(pocket: PocketState): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add("pocket-wrapper");

    const label = document.createElement("span");
    label.innerText = pocket.definition.id; // Use the ID as a label for now
    label.classList.add("pocket-label");

    const el = document.createElement("div");
    el.classList.add("pocket-grid");

    // Using CSS variables to avoid magic numbers in CSS
    el.style.setProperty("--cols", pocket.definition.dimensions.width.toString());
    el.style.setProperty("--rows", pocket.definition.dimensions.height.toString());

    // TODO: Render placed items inside this pocket

    wrapper.appendChild(label);
    wrapper.appendChild(el);
    return wrapper;
}