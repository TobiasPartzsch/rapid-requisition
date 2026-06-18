export interface Dimensions {
    readonly width: number;
    readonly height: number;
}

/**
 * Blueprints (Static Catalog Data)
 */
export interface PocketDefinition {
    readonly id: string;
    readonly dimensions: Dimensions;
}

export interface EquipmentDefinition {
    readonly id: string;
    readonly name: string;
    readonly pockets: readonly PocketDefinition[];
}

/**
 * Game State (Live Session Data)
 */
export interface ItemPlacement {
    readonly item: LootItem;
    readonly originX: number;
    readonly originY: number;
}

export interface PocketState {
    readonly definition: PocketDefinition;
    readonly placedItems: readonly ItemPlacement[];
}

export interface InventoryState {
    readonly equipmentId: string;
    readonly pockets: readonly PocketState[];
}

export interface LootItem {
    readonly id: string;
    readonly size: Dimensions;
    readonly color: string;
    readonly rotated: boolean;
}

export interface GameState {
    inventory: InventoryState;
    heldItem: LootItem | null;
}