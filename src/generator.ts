import { canPlaceItem, initializeInventory } from "./inventory";
import { EquipmentDefinition, InventoryState, LootItem } from "./types";

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
 * Fills a world container (like your 30x20 chest) with as much loot as fits.
 * Uses a simple "First Fit" greedy approach.
 */
export function fillContainerSpatial(blueprint: EquipmentDefinition): InventoryState {
    let state = initializeInventory(blueprint);

    // We process each pocket in the container
    const updatedPockets = state.pockets.map(pocket => {
        let currentPlaced = [...pocket.placedItems];
        const { width, height } = pocket.definition.dimensions;

        // Iterate through the grid
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // To keep it from being 100% full, we can add a "spawn chance"
                if (Math.random() > 0.7) continue;

                const newItem = generateLootForInventory(state);

                // Use your existing collision logic!
                if (canPlaceItem(newItem, { ...pocket, placedItems: currentPlaced }, x, y)) {
                    currentPlaced.push({
                        item: newItem,
                        originX: x,
                        originY: y
                    });
                }
            }
        }
        return { ...pocket, placedItems: currentPlaced };
    });

    return { ...state, pockets: updatedPockets };
}

/**
 * Attempts to add a single item to a random valid location in the container.
 */
export function replenishContainerSpatial(state: InventoryState): InventoryState {
    const pocket = state.pockets[0]; // Assuming our chest has one main pocket
    const newItem = generateLootForInventory(state);
    const { width, height } = pocket.definition.dimensions;

    // We'll try 50 random spots. If it fails, the chest is likely "full enough"
    for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);

        if (canPlaceItem(newItem, pocket, x, y)) {
            return {
                ...state,
                pockets: [{
                    ...pocket,
                    placedItems: [...pocket.placedItems, { item: newItem, originX: x, originY: y }]
                }]
            };
        }
    }
    return state; // No room found
}