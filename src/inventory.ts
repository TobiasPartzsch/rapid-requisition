import { Dimensions, EquipmentDefinition, InventoryState, ItemPlacement, LootItem, PocketState } from "./types";

export function canPlaceItem(
    item: LootItem,
    pocket: PocketState,
    x: number,
    y: number
): boolean {
    const dims = getEffectiveDimensions(item);

    // 1. Boundary Check
    if (x < 0 || y < 0) return false;
    if (x + dims.width > pocket.definition.dimensions.width) return false;
    if (y + dims.height > pocket.definition.dimensions.height) return false;

    // 2. Collision Check
    return !pocket.placedItems.some((placed) =>
        isOverlapping(
            { originX: x, originY: y, dimensions: dims },
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

export function initializeInventory(blueprint: EquipmentDefinition): InventoryState {
    return {
        equipmentId: blueprint.id,
        pockets: blueprint.pockets.map(p => ({
            definition: p,
            placedItems: []
        }))
    };
}

export function getEffectiveDimensions(item: LootItem): Dimensions {
    return item.rotated
        ? { width: item.size.height, height: item.size.width }
        : item.size;
}

export function rotateItem(item: LootItem): LootItem {
    return {
        ...item,
        rotated: !item.rotated
    };
}