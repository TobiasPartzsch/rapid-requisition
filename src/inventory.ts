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
            { item: item, originX: x, originY: y },
            placed
        )
    );
}

// Internal helper for clarity - keeping the geometry math separate
function isOverlapping(a: Omit<ItemPlacement, 'itemId'>, b: ItemPlacement): boolean {
    const dimsA = getEffectiveDimensions(a.item);
    const dimsB = getEffectiveDimensions(b.item);

    return (
        a.originX < b.originX + dimsB.width &&
        a.originX + dimsA.width > b.originX &&
        a.originY < b.originY + dimsB.height &&
        a.originY + dimsA.height > b.originY
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

/**
 * Calculates the top-left origin of an item when the user 
 * is targeting a specific grid cell as the center.
 */
export function getOriginFromCenter(
    centerX: number,
    centerY: number,
    item: LootItem
): { x: number, y: number } {
    const dims = getEffectiveDimensions(item);
    return {
        x: centerX - Math.floor(dims.width / 2),
        y: centerY - Math.floor(dims.height / 2)
    };
}

export function getInventoryBounds(state: InventoryState) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    state.pockets.forEach(p => {
        const { x, y } = p.definition.position;
        const { width, height } = p.definition.dimensions;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    return {
        minX, minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

/**
 * Attempts to place a specific item into the first available slot in an inventory.
 * Returns a new InventoryState if successful, otherwise null.
 */
export function tryPlaceAnywhere(inventory: InventoryState, item: LootItem): InventoryState | null {
    console.log(`Try to fit ${item.size}`)
    for (const pocket of inventory.pockets) {
        const { width, height } = pocket.definition.dimensions;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (canPlaceItem(item, pocket, x, y)) {
                    const updatedPockets = inventory.pockets.map(p =>
                        p.definition.id === pocket.definition.id
                            ? { ...p, placedItems: [...p.placedItems, { item, originX: x, originY: y }] }
                            : p
                    );
                    return { ...inventory, pockets: updatedPockets };
                }
            }
        }
    }
    return null;
}