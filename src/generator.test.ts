import { describe, expect, it } from "vitest";
import { generateRandomItem, GenerationConstraints } from "./generator";

describe("Item Generator", () => {
    it("should generate an item within the specified constraints", () => {
        const constraints: GenerationConstraints = {
            maxWidth: 2,
            maxHeight: 2
        };

        const item = generateRandomItem(constraints);

        expect(item.size.width).toBeLessThanOrEqual(constraints.maxWidth);
        expect(item.size.height).toBeLessThanOrEqual(constraints.maxHeight);
    });

    it("should generate valid color strings", () => {
        const constraints: GenerationConstraints = { maxWidth: 1, maxHeight: 1 };
        const item = generateRandomItem(constraints);

        // A simple check for hex color format
        expect(item.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
});