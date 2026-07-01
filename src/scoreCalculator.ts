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
            completionBonus = (timeLimitSeconds - elapsedSeconds)
                * countdownScoring.timeBonusPerSecond;
        }
    } else {
        baseScore = occupiedCells * timeAttackScoring.pointsPerCell;
        if (isFullClear) {
            const expectedSeconds = totalCapacity * timeAttackScoring.expectedSecondsPerCell;
            const timeDelta = expectedSeconds - elapsedSeconds;
            const timeBonus = Math.floor(timeDelta * timeAttackScoring.timeBonusPerSecond);
            completionBonus = timeAttackScoring.baseCompletionBonus + Math.max(0, timeBonus);
        }
    }

    const total = Math.max(0, baseScore + completionBonus);
    return { baseScore, completionBonus, total };
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