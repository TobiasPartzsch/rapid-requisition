export enum LootGenerationMode {
    REFILL = 'REFILL',      // The current "Static Minimum" behavior
    LARGE_HAUL = 'LARGE_HAUL' // Generate a massive grid of loot at the start
}

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
    readonly position: { readonly x: number, readonly y: number }; // Relative grid offset
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
    placedItems: readonly ItemPlacement[];
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

export type ItemSource = 'PLAYER_INVENTORY' | 'LOOT_CHEST';

export enum GameMode {
    COUNTDOWN = 'COUNTDOWN',     // Score based on efficiency/density
    TIME_ATTACK = 'TIME_ATTACK'  // Score based on speed
}

export interface GameState {
    inventory: InventoryState;
    lootSource: InventoryState;
    heldItem: LootItem | null;
    heldItemSource: ItemSource | null;

    // Live Session Metrics
    startTime: number | null;
    endTime: number | null;
    itemsStashedCount: number;
}

export interface CountdownScoringSettings {
    readonly pointsPerCell: number;
    readonly perfectFillBonus: number;
}

export interface TimeAttackScoringSettings {
    readonly timeBonusMultiplier: number;
    readonly rotationPenaltySeconds: number;
}

export interface GameSettings {
    readonly lootMode: LootGenerationMode;
    readonly gameMode: GameMode;
    readonly selectedGearKey: string;
    readonly minQueueItems: number;
    readonly timeLimitSeconds: number;
    readonly cellSize: number;
    readonly countdownScoring: CountdownScoringSettings;
    readonly timeAttackScoring: TimeAttackScoringSettings;
}

export const DEFAULT_SETTINGS: GameSettings = {
    lootMode: LootGenerationMode.REFILL,
    gameMode: GameMode.COUNTDOWN,
    selectedGearKey: "FULL_RAID_KIT",
    minQueueItems: 5,
    timeLimitSeconds: 180,
    cellSize: 30,
    countdownScoring: {
        pointsPerCell: 1,
        perfectFillBonus: 0,
    },
    timeAttackScoring: {
        timeBonusMultiplier: 1,
        rotationPenaltySeconds: 0,
    },
};

export interface HighScore {
    readonly playerName: string;
    readonly score: number;
    readonly timestamp: number;
    readonly gearId: string;
}

export type ScoreTable = Record<GameMode, readonly HighScore[]>;

export interface ScoreBreakdown {
    readonly baseScore: number;
    readonly timeBonus: number;
    readonly densityBonus: number;
    readonly total: number;
}