import { DEFAULT_SETTINGS, GameSettings } from "./types";

const SETTINGS_KEY = "rapid_requisition_settings_v1";

export function saveSettings(settings: GameSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): GameSettings {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_SETTINGS;

    try {
        // We merge with defaults to ensure new fields are populated
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
        console.error("Settings vault corrupted, resetting to defaults", e);
        return DEFAULT_SETTINGS;
    }
}