import { ItemPlacement, LootItem, PocketState } from "./types";

export function canPlaceItem(
    item: LootItem,
    pocket: PocketState,
    x: number,
    y: number
): boolean {
    // 1. Boundary Check
    if (x < 0 || y < 0) return false;
    if (x + item.size.width > pocket.definition.dimensions.width) return false;
    if (y + item.size.height > pocket.definition.dimensions.height) return false;

    // 2. Collision Check
    return !pocket.placedItems.some((placed) =>
        isOverlapping(
            { originX: x, originY: y, dimensions: item.size },
            placed
        )
    );
}

// Internal helper for clarity - keeping the geometry math separate
function isOverlapping(a: Omit<ItemPlacement, 'itemId'>, b: ItemPlacement): boolean {
    return (
        a.originX < b.originX + b.dimensions.width &&
        a.originX + a.dimensions.width > b.originX &&
        a.originY < b.originY + b.dimensions.height &&
        a.originY + a.dimensions.height > b.originY
    );
}