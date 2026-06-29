interface GridCoord {
    x: number;
    y: number;
}

export const UI_CONFIG = {
    GAP: 2,
    CHEST_WIDTH: 30,
    CHEST_HEIGHT: 20,
    COLOR_GRID_BG: "#1a1a1a",
    COLOR_GRID_BORDER: "#4d4d4d",
    COLOR_POCKET_BORDER: "#d8d1d1",
    QUEUE_PADDING: 10,
} as const;

export const VIEW_REGIONS = {
    INVENTORY: { x: 50, y: 50, w: 600, h: 600 },
    QUEUE: { x: 500, y: 50, w: 200, h: 500 }
} as const;

/** 
 * Helper to calculate pixel dimensions based on grid units 
 */
export function gridToPx(units: number, cellSize: number): number {
    return (units * cellSize) + (units - 1) * UI_CONFIG.GAP;
}

/**
 * Translates a mouse pixel offset into a discrete grid coordinate.
 */
export function screenToGrid(offsetX: number, offsetY: number, cellSize: number): GridCoord {
    const x = Math.floor(offsetX / (cellSize + UI_CONFIG.GAP));
    const y = Math.floor(offsetY / (cellSize + UI_CONFIG.GAP));
    return { x, y };
}