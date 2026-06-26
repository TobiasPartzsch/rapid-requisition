import { SCORES_KEY, ScoreRegistry, getInitialRegistry } from "./scores";
import { GameMode, GameState, InventoryState, PocketState, ScoreBreakdown } from "./types";

const POINTS_PER_CELL = 10;
const DENSITY_MULTIPLIER = 1000;
const TIME_PENALTY_PER_SECOND = 5;

export function calculateScore(
    mode: GameMode,
    state: GameState,
    elapsedSeconds: number,
    timeLimit?: number,
): ScoreBreakdown {
    const occupiedCells = countOccupiedCells(state.inventory);
    const totalCapacity = countTotalCapacityFromPockets(state.inventory.pockets);
    const densityRatio = totalCapacity > 0 ? occupiedCells / totalCapacity : 0;

    let baseScore = occupiedCells * POINTS_PER_CELL;
    let timeBonus = 0;

    if (mode === GameMode.TIME_ATTACK) {
        // Time Attack: Penalty for every second spent
        timeBonus = -(elapsedSeconds * TIME_PENALTY_PER_SECOND);
    } else if (mode === GameMode.COUNTDOWN && timeLimit) {
        // Countdown: Bonus for remaining time if inventory is full
        const remaining = Math.max(0, timeLimit - elapsedSeconds);
        timeBonus = remaining * 10;
    }

    const total = Math.max(0, baseScore + timeBonus + Math.floor(densityRatio * DENSITY_MULTIPLIER));

    return { baseScore, timeBonus, densityBonus: Math.floor(densityRatio * DENSITY_MULTIPLIER), total };
}

export function loadScores(): ScoreRegistry {
    const saved = localStorage.getItem(SCORES_KEY);
    const initial = getInitialRegistry();

    if (!saved) return initial;

    try {
        const parsed = JSON.parse(saved);

        // Merge the saved data into the initial structure.
        // This ensures that even if 'parsed' is missing a new gear ID, 
        // the returned object will have an empty array for it.
        return {
            [GameMode.COUNTDOWN]: { ...initial[GameMode.COUNTDOWN], ...parsed[GameMode.COUNTDOWN] },
            [GameMode.TIME_ATTACK]: { ...initial[GameMode.TIME_ATTACK], ...parsed[GameMode.TIME_ATTACK] }
        };
    } catch {
        return initial;
    }
}

export function countOccupiedCells(inventory: InventoryState): number {
    return inventory.pockets.reduce((total, pocket) => {
        return total + pocket.placedItems.reduce((pSum, placed) => {
            // Area = width * height
            return pSum + (placed.item.size.width * placed.item.size.height);
        }, 0);
    }, 0);
}

export function countTotalCapacityFromPockets(pockets: readonly PocketState[]): number {
    return pockets.reduce((acc, p) =>
        acc + (p.definition.dimensions.width * p.definition.dimensions.height), 0);
}