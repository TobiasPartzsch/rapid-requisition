import { InventoryState, PocketState } from "../types";

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
    el.style.setProperty("--cols", pocket.definition.dimensions.width.toString());
    el.style.setProperty("--rows", pocket.definition.dimensions.height.toString());

    // Create a listener for the whole grid
    el.addEventListener("click", (e) => {
        const rect = el.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 32); // 30px + 2px gap
        const y = Math.floor((e.clientY - rect.top) / 32);
        onCellClick(pocket, x, y);
    });

    // TODO: Render the items already placed (we need this to see them!)
    return el;
}