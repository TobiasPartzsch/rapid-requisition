import { EquipmentDefinition } from "./types";
import { UI_CONFIG } from "./view/constants";

export const EQUIPMENT_CATALOG: Record<string, EquipmentDefinition> = {
    HIP_BAG: {
        id: "blueprint-hip-bag",
        name: "Standard Hip Bag",
        pockets: [
            { id: "p1", dimensions: { width: 3, height: 2 }, position: { x: 0, y: 0 } },
        ]
    },
    TACTICAL_VEST: {
        id: "blueprint-tac-vest",
        name: "Operator Vest",
        pockets: [
            { id: "v1", dimensions: { width: 1, height: 2 }, position: { x: 0, y: 0 } },
            { id: "v2", dimensions: { width: 1, height: 2 }, position: { x: 3, y: 0 } },
            { id: "v3", dimensions: { width: 4, height: 6 }, position: { x: 0, y: 3 } },
        ],
    },
    ASSAULT_PACK: {
        id: "blueprint-assault-pack",
        name: "3-Day Assault Pack",
        pockets: [
            // A balanced main compartment
            { id: "main", dimensions: { width: 5, height: 7 }, position: { x: 2, y: 0 } },
            // Two tall, narrow side channels (perfect for 1xN items)
            { id: "side-l", dimensions: { width: 2, height: 6 }, position: { x: 0, y: 1 } },
            { id: "side-r", dimensions: { width: 2, height: 6 }, position: { x: 7, y: 1 } },
        ]
    },
    COURIER_BAG: {
        id: "blueprint-courier-bag",
        name: "Messenger Satchel",
        pockets: [
            // Wide but short - creates a "Landscape" challenge
            { id: "main", dimensions: { width: 8, height: 4 }, position: { x: 0, y: 0 } },
            // Small internal divider
            { id: "internal", dimensions: { width: 4, height: 1 }, position: { x: 2, y: 5 } },
        ]
    },
    MEDIC_CHEST_RIG: {
        id: "blueprint-medic-rig",
        name: "Field Medic Rig",
        pockets: [
            // Many small, identical pockets - the "Grid" challenge
            { id: "p1", dimensions: { width: 2, height: 2 }, position: { x: 0, y: 0 } },
            { id: "p2", dimensions: { width: 2, height: 2 }, position: { x: 3, y: 0 } },
            { id: "p3", dimensions: { width: 2, height: 2 }, position: { x: 6, y: 0 } },
            { id: "p4", dimensions: { width: 2, height: 2 }, position: { x: 0, y: 3 } },
            { id: "p5", dimensions: { width: 2, height: 2 }, position: { x: 3, y: 3 } },
            { id: "p6", dimensions: { width: 2, height: 2 }, position: { x: 6, y: 3 } },
        ]
    },
    FULL_RAID_KIT: {
        id: 'full-raid-kit',
        name: 'Full Raid Gear',
        pockets: [
            // Main Backpack (The big one)
            { id: 'main-pack', dimensions: { width: 8, height: 12 }, position: { x: 3, y: 0 } },
            // Left/Right Pouches
            { id: 'side-pouch-l1', dimensions: { width: 2, height: 4 }, position: { x: 0, y: 4 } },
            { id: 'side-pouch-l2', dimensions: { width: 2, height: 4 }, position: { x: 0, y: 9 } },
            { id: 'side-pouch-r1', dimensions: { width: 2, height: 4 }, position: { x: 12, y: 4 } },
            { id: 'side-pouch-r2', dimensions: { width: 2, height: 4 }, position: { x: 12, y: 9 } },
            // Plate Carrier (A bit restrictive)
            { id: 'plate-carrier', dimensions: { width: 6, height: 4 }, position: { x: 4, y: 13 } },
            // Magazine Pouches
            { id: 'mag-1', dimensions: { width: 1, height: 2 }, position: { x: 5, y: 18 } },
            { id: 'mag-2', dimensions: { width: 1, height: 2 }, position: { x: 6, y: 18 } },
            { id: 'mag-3', dimensions: { width: 1, height: 2 }, position: { x: 7, y: 18 } },
            { id: 'mag-4', dimensions: { width: 1, height: 2 }, position: { x: 8, y: 18 } },
        ],
    },
};

export const CONTAINER_CATALOG: Record<string, EquipmentDefinition> = {
    LOOT_CHEST_LARGE: {
        id: "blueprint-loot-chest-large",
        name: "Overflowing Chest",
        pockets: [
            {
                id: "main-cavity",
                dimensions: { width: UI_CONFIG.CHEST_WIDTH, height: UI_CONFIG.CHEST_HEIGHT },
                position: { x: 0, y: 0 }
            },
        ]
    }
};