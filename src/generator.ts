import { canPlaceItem, initializeInventory, rotateItem, tryPlaceAnywhere } from "./inventory";
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
 * Fills a container by repeatedly attempting to "drop" items 
 * until it becomes too crowded.
 */
export function fillContainerSpatial(blueprint: EquipmentDefinition): InventoryState {
    console.log("fill container")
    let state = initializeInventory(blueprint);
    const MAX_FAILURES = 10;
    let consecutiveFailures = 0;

    // We keep trying to add items until the "failure hoard" grows too large
    while (consecutiveFailures < MAX_FAILURES) {
        let newItem = generateLootForInventory(state);

        let nextState = tryPlaceAnywhere(state, newItem);

        if (!nextState) {
            nextState = tryPlaceAnywhere(state, rotateItem(newItem));
        }

        if (nextState) {
            state = nextState;
            consecutiveFailures = 0; // Success! Reset the counter
        } else {
            consecutiveFailures++; // Increment failure count
        }
    }

    return state;
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