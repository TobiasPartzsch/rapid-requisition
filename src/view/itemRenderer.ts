import { getEffectiveDimensions } from "../inventory.js";
import { Dimensions, LootItem } from "../types.js";

export function createItemElement(item: LootItem): HTMLElement {
    const el = document.createElement("div");
    el.classList.add("loot-item");

    const dims = getEffectiveDimensions(item);

    el.style.width = `${dims.width * 30 + (dims.width - 1) * 2}px`;
    el.style.height = `${dims.height * 30 + (dims.height - 1) * 2}px`;
    el.style.backgroundColor = item.color;

    return el;
}

export function updatePreviewPosition(el: HTMLElement, x: number, y: number, dims: Dimensions): void {
    // Calculate pixels: (units * 30px) + (gaps * 2px)
    const widthPx = (dims.width * 30) + (dims.width - 1) * 2;
    const heightPx = (dims.height * 30) + (dims.height - 1) * 2;

    el.style.left = `${x - widthPx / 2}px`;
    el.style.top = `${y - heightPx / 2}px`;
}