import { getEffectiveDimensions } from "../inventory.js";
import { LootItem } from "../types.js";
import { gridToPx, UI_CONFIG } from "./constants.js";

export function drawLootItem(
    ctx: CanvasRenderingContext2D,
    item: LootItem,
    pxX: number,
    pxY: number
): void {
    const dims = getEffectiveDimensions(item);
    const w = gridToPx(dims.width);
    const h = gridToPx(dims.height);

    ctx.fillStyle = item.color;
    ctx.fillRect(pxX, pxY, w, h);

    // Add a subtle border to make items pop
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pxX, pxY, w, h);
}

export function drawLootQueue(
    ctx: CanvasRenderingContext2D,
    items: readonly LootItem[]
): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let currentY = UI_CONFIG.QUEUE_PADDING;
    const centerX = UI_CONFIG.QUEUE_PADDING;

    items.forEach(item => {
        drawLootItem(ctx, item, centerX, currentY);
        // Move the cursor down for the next item based on its height + padding
        const itemHeight = gridToPx(item.size.height);
        currentY += itemHeight + UI_CONFIG.GAP + UI_CONFIG.QUEUE_PADDING;
    });
}

export function getItemAtPosition(items: readonly LootItem[], mouseX: number, mouseY: number): number {
    let currentY = UI_CONFIG.QUEUE_PADDING;
    const centerX = UI_CONFIG.QUEUE_PADDING;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const w = gridToPx(item.size.width);
        const h = gridToPx(item.size.height);

        // Check if mouse is within this item's bounding box
        if (mouseX >= centerX && mouseX <= centerX + w &&
            mouseY >= currentY && mouseY <= currentY + h) {
            return i; // Found the index!
        }

        currentY += h + UI_CONFIG.GAP + UI_CONFIG.QUEUE_PADDING;
    }

    return -1; // Clicked on empty space
}