import { DEFAULT_QUEUE_SETTINGS, QueueSettings } from "./queue";
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

    const rollA = rollSkewedDimension(bounds.width);
    const rollB = rollSkewedDimension(bounds.height);

    // Ensure width is always the larger dimension (Landscape orientation)
    const w = Math.max(rollA, rollB);
    const h = Math.min(rollA, rollB);

    return {
        id: crypto.randomUUID(),
        size: { width: w, height: h },
        color: generateHsl(w, h),
        rotated: false
    };
}

function rollSkewedDimension(max: number): number {
    // x^5 distribution: smaller numbers are more likely.
    return Math.floor(Math.pow(Math.random(), 5) * max) + 1;
}

function generateHsl(w: number, h: number): string {
    // Using area as a seed for the hue
    const hue = (w * h * 137.5) % 360;
    return `hsl(${hue}, ${SETTINGS.saturation}%, ${SETTINGS.lightness}%)`;
}

/**
 * Ensures the loot queue meets the minimum item requirement.
 */
export function replenishLootQueue(
    currentQueue: readonly LootItem[],
    inventory: InventoryState,
    settings: QueueSettings = DEFAULT_QUEUE_SETTINGS
): LootItem[] {
    const itemsNeeded = settings.minItems - currentQueue.length;
    if (itemsNeeded <= 0) return [...currentQueue];

    const newItems = Array.from({ length: itemsNeeded }, () =>
        generateLootForInventory(inventory)
    );

    return [...currentQueue, ...newItems];
}