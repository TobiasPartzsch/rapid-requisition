import { LootItem } from "./types";

export interface QueueSettings {
    readonly minItems: number;
    readonly maxItems: number;
}

export interface LootQueueState {
    readonly items: readonly LootItem[];
    readonly settings: QueueSettings;
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
    minItems: 5,
    maxItems: 8
};