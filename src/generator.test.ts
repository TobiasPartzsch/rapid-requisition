import { describe, expect, it } from "vitest";
import { generateLootForInventory } from "./generator";
import { InventoryState } from "./types";

describe("Item Generator", () => {
    // Mock inventory for testing
    const mockInventory: InventoryState = {
        equipmentId: "test-bag",
        pockets: [{
            definition: { id: "p1", dimensions: { width: 4, height: 4 }, position: { x: 0, y: 0 } },
            placedItems: []
        }]
    };

    it("should generate an item within the bounds of the largest pocket", () => {
        const item = generateLootForInventory(mockInventory);

        expect(item.size.width).toBeGreaterThanOrEqual(1);
        expect(item.size.width).toBeLessThanOrEqual(4);
        expect(item.size.height).toBeGreaterThanOrEqual(1);
        expect(item.size.height).toBeLessThanOrEqual(4);
    });

    it("should generate valid HSL color strings", () => {
        const item = generateLootForInventory(mockInventory);

        // Regex for HSL format: hsl(hue, sat%, light%)
        expect(item.color).toMatch(/^hsl\(\d+(\.\d+)?,\s*\d+%,\s*\d+%\)$/);
    });

    it("should favor smaller items (statistical check)", () => {
        const iterations = 10000;
        let smallItems = 0;

        for (let i = 0; i < iterations; i++) {
            const item = generateLootForInventory(mockInventory);
            // In a 4x4 max, 1x1 and 1x2 etc are "small"
            if (item.size.width <= 2 && item.size.height <= 2) {
                smallItems++;
            }
        }

        // With x^2 distribution, we expect significantly more than 25% (random) 
        // to be in the bottom-left quadrant of the size possibilities.
        expect(smallItems).toBeGreaterThan(iterations * 0.5);
    });
});