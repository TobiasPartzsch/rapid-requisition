import { DEFAULT_SETTINGS, GameSettings } from "./types";

const SETTINGS_KEY = "rapid_requisition_settings_v1";

export function saveSettings(settings: GameSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): GameSettings {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    try {
        const parsed = JSON.parse(saved);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            countdownScoring: { ...DEFAULT_SETTINGS.countdownScoring, ...parsed.countdownScoring },
            timeAttackScoring: { ...DEFAULT_SETTINGS.timeAttackScoring, ...parsed.timeAttackScoring },
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

const PILOT_NAME_KEY = "rapid_requisition_pilot_name";

export function loadPilotName(): string {
    return localStorage.getItem(PILOT_NAME_KEY) ?? "";
}

export function savePilotName(name: string): void {
    localStorage.setItem(PILOT_NAME_KEY, name);
}
