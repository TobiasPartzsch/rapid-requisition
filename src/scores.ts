import { EQUIPMENT_CATALOG } from "./catalog";
import { GameMode, HighScore } from "./types";

export const SCORES_KEY = "rapid_requisition_scores_v1";

// Mapping each mode to its own list of top scores
export type ScoreRegistry = Record<GameMode, Record<string, readonly HighScore[]>>;
// Usage: registry[GameMode.TIME_ATTACK]["HIP_BAG"] -> [Top 10]

const INITIAL_REGISTRY: ScoreRegistry = getInitialRegistry();

export function getInitialRegistry(): ScoreRegistry {
    const gearIds = Object.keys(EQUIPMENT_CATALOG);

    // Helper to create an empty table for all known gear
    const createEmptyGearMap = () => {
        const map: Record<string, readonly HighScore[]> = {};
        for (const id of gearIds) {
            map[id] = [];
        }
        return map;
    };

    return {
        [GameMode.COUNTDOWN]: createEmptyGearMap(),
        [GameMode.TIME_ATTACK]: createEmptyGearMap()
    };
}

export function loadScores(): ScoreRegistry {
    const saved = localStorage.getItem(SCORES_KEY);
    if (!saved) return INITIAL_REGISTRY;
    try {
        return { ...INITIAL_REGISTRY, ...JSON.parse(saved) };
    } catch {
        return INITIAL_REGISTRY;
    }
}

export function saveScore(mode: GameMode, gearId: string, entry: HighScore): void {
    const registry = loadScores();
    const existingScores = registry[mode][gearId] || [];
    const updatedGearScores = [...existingScores, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    const updatedRegistry: ScoreRegistry = {
        ...registry,
        [mode]: {
            ...registry[mode],
            [gearId]: updatedGearScores
        }
    };

    localStorage.setItem(SCORES_KEY, JSON.stringify(updatedRegistry));
}

export function purgeScores(): void {
    localStorage.removeItem(SCORES_KEY);
}