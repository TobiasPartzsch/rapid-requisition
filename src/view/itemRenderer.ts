import { getEffectiveDimensions } from "../inventory.js";
import { LootItem } from "../types.js";

export function createItemElement(item: LootItem): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("loot-item");

    const dims = getEffectiveDimensions(item);

    el.style.width = `${dims.width * 30 + (dims.width - 1) * 2}px`;
    el.style.height = `${dims.height * 30 + (dims.height - 1) * 2}px`;
    el.style.backgroundColor = item.color;

    return el;
}