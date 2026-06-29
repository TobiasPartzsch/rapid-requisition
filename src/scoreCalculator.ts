import { SCORES_KEY, ScoreRegistry, getInitialRegistry } from "./scores";
import { CountdownScoringSettings, GameMode, GameState, InventoryState, PocketState, ScoreBreakdown, TimeAttackScoringSettings } from "./types";

export function calculateScore(
    mode: GameMode,
    state: GameState,
    elapsedSeconds: number,
    countdownScoring: CountdownScoringSettings,
    timeAttackScoring: TimeAttackScoringSettings,
    timeLimitSeconds: number,
): ScoreBreakdown {
    const occupiedCells = countOccupiedCells(state.inventory);
    const totalCapacity = countTotalCapacityFromPockets(state.inventory.pockets);
    const isFullClear = occupiedCells === totalCapacity;

    let baseScore = 0;
    let completionBonus = 0;

    if (mode === GameMode.COUNTDOWN) {
        baseScore = occupiedCells * countdownScoring.pointsPerCell;
        if (isFullClear) {
            console.log(timeLimitSeconds, elapsedSeconds, countdownScoring.timeBonusPerSecond)
            completionBonus = (timeLimitSeconds - elapsedSeconds)
                * countdownScoring.timeBonusPerSecond;
        }
    } else {
        baseScore = occupiedCells * timeAttackScoring.pointsPerCell;
        if (isFullClear) {
            completionBonus = timeAttackScoring.completionBonus;
        }
    }

    const total = Math.max(0, baseScore + completionBonus);
    return { baseScore, completionBonus, total };
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