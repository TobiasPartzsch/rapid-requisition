import { InventoryState, LootItem } from "./types";

export interface GenerationConstraints {
    readonly maxWidth: number;
    readonly maxHeight: number;
}

interface ColorSettings {
    readonly saturation: number;
    readonly lightness: number;
}

const SETTINGS: ColorSettings = {
    saturation: 65,
    lightness: 55
};

export function generateLootForInventory(inventory: InventoryState): LootItem {
    // Find the absolute maximum bounds of the largest pocket
    const bounds = inventory.pockets.reduce((max, p) => ({
        width: Math.max(max.width, p.definition.dimensions.width),
        height: Math.max(max.height, p.definition.dimensions.height)
    }), { width: 1, height: 1 });

    const w = rollSkewedDimension(bounds.width);
    const h = rollSkewedDimension(bounds.height);

    return {
        id: crypto.randomUUID(),
        size: { width: w, height: h },
        color: generateHsl(w, h),
        rotated: false
    };
}

function rollSkewedDimension(max: number): number {
    // x^2 distribution: smaller numbers are more likely.
    // floor(0.0 * 4) + 1 = 1
    // floor(0.9 * 4) + 1 = 4
    return Math.floor(Math.pow(Math.random(), 2) * max) + 1;
}

function generateHsl(w: number, h: number): string {
    // Using area as a seed for the hue
    const hue = (w * h * 137.5) % 360;
    return `hsl(${hue}, ${SETTINGS.saturation}%, ${SETTINGS.lightness}%)`;
}