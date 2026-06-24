import { getEffectiveDimensions } from "../inventory";
import { InventoryState, LootItem } from "../types";
import { gridToPx, UI_CONFIG } from "./constants";

/**
 * Draws the static grid infrastructure. 
 * Call this only when equipment changes.
 */
export function drawInventoryBackground(
    ctx: CanvasRenderingContext2D,
    state: InventoryState
): void {
    const { CELL_SIZE, GAP, COLOR_GRID_BG } = UI_CONFIG;

    // Clear the background first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    state.pockets.forEach(pocket => {
        const { width, height } = pocket.definition.dimensions;
        const offset = pocket.definition.position;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const pxX = (offset.x + x) * (CELL_SIZE + GAP);
                const pxY = (offset.y + y) * (CELL_SIZE + GAP);

                ctx.fillStyle = COLOR_GRID_BG;
                ctx.fillRect(pxX, pxY, CELL_SIZE, CELL_SIZE);
            }
        }
        const borderX = offset.x * (CELL_SIZE + GAP) - 1;
        const borderY = offset.y * (CELL_SIZE + GAP) - 1;
        const borderWidth = width * (CELL_SIZE + GAP) - GAP + 2;
        const borderHeight = height * (CELL_SIZE + GAP) - GAP + 2;

        ctx.strokeStyle = UI_CONFIG.COLOR_POCKET_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(borderX, borderY, borderWidth, borderHeight);
    });
}

/**
 * Draws the items currently placed in the pockets.
 * Call this every time the foreground needs a refresh.
 */
export function drawInventoryItems(
    ctx: CanvasRenderingContext2D,
    state: InventoryState
): void {
    const { CELL_SIZE, GAP } = UI_CONFIG;

    state.pockets.forEach(pocket => {
        const offset = pocket.definition.position;

        pocket.placedItems.forEach(placement => {
            // Calculate pixel position based on pocket offset + placement origin
            const pxX = (offset.x + placement.originX) * (CELL_SIZE + GAP);
            const pxY = (offset.y + placement.originY) * (CELL_SIZE + GAP);

            drawLootItem(ctx, placement.item, pxX, pxY);
        });
    });
}

/**
 * Draws the item following the cursor.
 */
export function drawHeldItem(
    ctx: CanvasRenderingContext2D,
    item: LootItem,
    mouseX: number,
    mouseY: number
): void {
    const dims = getEffectiveDimensions(item);
    const w = gridToPx(dims.width);
    const h = gridToPx(dims.height);

    ctx.save();
    ctx.globalAlpha = 0.7; // Transparency for the ghost effect
    // Center the item on the mouse
    drawLootItem(ctx, item, mouseX - w / 2, mouseY - h / 2);
    ctx.restore();
}

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
