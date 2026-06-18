import { describe, expect, it } from "vitest";
import { canPlaceItem } from "./inventory";
import { LootItem, PocketState } from "./types";

describe("Inventory Logic", () => {
    const mockPocket: PocketState = {
        definition: { id: "p1", dimensions: { width: 5, height: 5 } },
        placedItems: [
            {
                item: { id: "new", size: { width: 2, height: 2 }, color: "red", rotated: false },
                originX: 1,
                originY: 1,
            }
        ]
    };

    it("should allow placing an item in an empty spot within bounds", () => {
        const item: LootItem = { id: "new", size: { width: 1, height: 1 }, color: "red", rotated: false };
        // Place at 0,0 - far from the 1,1 item
        expect(canPlaceItem(item, mockPocket, 0, 0)).toBe(true);
    });

    it("should reject items that are out of bounds", () => {
        const item: LootItem = { id: "new", size: { width: 2, height: 2 }, color: "red", rotated: false };
        // 4 + 2 = 6, which exceeds the width of 5
        expect(canPlaceItem(item, mockPocket, 4, 0)).toBe(false);
    });

    it("should reject items that overlap with existing items", () => {
        const item: LootItem = { id: "new", size: { width: 1, height: 1 }, color: "red", rotated: false };
        // 1,1 is exactly where the existing item starts
        expect(canPlaceItem(item, mockPocket, 1, 1)).toBe(false);
        // 2,2 is also inside the 2x2 area starting at 1,1
        expect(canPlaceItem(item, mockPocket, 2, 2)).toBe(false);
    });

    it("should allow a 2x1 item to fit in a 1x2 slot if rotated", () => {
        const pocket: PocketState = {
            definition: { id: "p1", dimensions: { width: 1, height: 2 } },
            placedItems: []
        };
        const item: LootItem = { id: "2x1", size: { width: 2, height: 1 }, color: "blue", rotated: true };

        // As 2x1 it fails, but as 1x2 (rotated) it should pass
        expect(canPlaceItem(item, pocket, 0, 0)).toBe(true);
    });
});