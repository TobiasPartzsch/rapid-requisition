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

function getConstraintsFromInventory(inventory: InventoryState): GenerationConstraints {
    return inventory.pockets.reduce((max, p) => ({
        maxWidth: Math.max(max.maxWidth, p.definition.dimensions.width),
        maxHeight: Math.max(max.maxHeight, p.definition.dimensions.height)
    }), { maxWidth: 1, maxHeight: 1 });
}

function generateLootWithConstraints(constraints: GenerationConstraints): LootItem {
    const w = rollSkewedDimension(constraints.maxWidth);
    const h = rollSkewedDimension(Math.min(w, constraints.maxHeight));
    return {
        id: crypto.randomUUID(),
        size: { width: w, height: h },
        color: generateHsl(w, h),
        rotated: false
    };
}

export function generateLootForInventory(inventory: InventoryState): LootItem {
    return generateLootWithConstraints(getConstraintsFromInventory(inventory));
}

function rollSkewedDimension(max: number): number {
    return Math.floor(Math.pow(Math.random(), 5) * max) + 1;
}

function generateHsl(w: number, h: number): string {
    const [small, large] = w <= h ? [w, h] : [h, w];
    const hue = (small * 137.5 + large * 97.3) % 360;
    return `hsl(${hue}, ${SETTINGS.saturation}%, ${SETTINGS.lightness}%)`;
}

export function fillContainerSpatial(
    blueprint: EquipmentDefinition,
    constraintSource: InventoryState
): InventoryState {
    let state = initializeInventory(blueprint);
    const MAX_FAILURES = 10;
    let consecutiveFailures = 0;

    while (consecutiveFailures < MAX_FAILURES) {
        const newItem = generateLootForInventory(constraintSource);
        const nextState =
            tryPlaceAnywhere(state, newItem) ??
            tryPlaceAnywhere(state, rotateItem(newItem));

        if (nextState) {
            state = nextState;
            consecutiveFailures = 0;
        } else {
            consecutiveFailures++;
        }
    }

    return state;
}

export function replenishContainerSpatial(
    state: InventoryState,
    constraintSource: InventoryState
): InventoryState {
    const pocket = state.pockets[0];
    const newItem = generateLootForInventory(constraintSource);
    const { width, height } = pocket.definition.dimensions;

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
    return state;
}