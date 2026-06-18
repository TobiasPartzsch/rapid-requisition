import { LootItem } from "./types";

export interface GenerationConstraints {
    readonly maxWidth: number;
    readonly maxHeight: number;
}

export function generateRandomItem(constraints: GenerationConstraints): LootItem {
    // TODO: Logic to generate random width/height within constraints
    // Logic to pick a random category and assign a corresponding color
    // For now, we can return a placeholder or a simple 1x1
    return {
        id: crypto.randomUUID(),
        size: { width: 1, height: 1 },
        color: "#808080"
    };
}