interface GridCoord {
    x: number;
    y: number;
}

export const UI_CONFIG = {
    CELL_SIZE: 30,
    GAP: 2,
    COLOR_GRID_BG: "#1a1a1a",
    COLOR_GRID_BORDER: "#333333",
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
export function gridToPx(units: number): number {
    return (units * UI_CONFIG.CELL_SIZE) + (units - 1) * UI_CONFIG.GAP;
}

/**
 * Translates a mouse pixel offset into a discrete grid coordinate.
 */
export function screenToGrid(offsetX: number, offsetY: number): GridCoord {
    const x = Math.floor(offsetX / (UI_CONFIG.CELL_SIZE + UI_CONFIG.GAP));
    const y = Math.floor(offsetY / (UI_CONFIG.CELL_SIZE + UI_CONFIG.GAP));
    return { x, y };
}