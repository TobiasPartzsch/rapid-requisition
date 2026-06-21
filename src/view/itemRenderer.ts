import { getEffectiveDimensions } from "../inventory";
import { LootItem } from "../types";
import { gridToPx } from "./constants";

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

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pxX, pxY, w, h);
}

/**
 * Draws the "Ghost" item for the cursor, centered on coordinates.
 */
export function drawHeldItem(
    ctx: CanvasRenderingContext2D,
    item: LootItem,
    pxX: number,
    pxY: number
): void {
    const dims = getEffectiveDimensions(item);
    const w = gridToPx(dims.width);
    const h = gridToPx(dims.height);

    ctx.save();
    ctx.globalAlpha = 0.6; // Make it ethereal
    drawLootItem(ctx, item, pxX - w / 2, pxY - h / 2);
    ctx.restore();
}