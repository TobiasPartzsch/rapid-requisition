import { EquipmentDefinition } from "./types";

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
    FULL_RAID_KIT: {
        id: 'full-raid-kit',
        name: 'Full Raid Gear',
        pockets: [
            // Main Backpack (The big one)
            { id: 'main-pack', dimensions: { width: 8, height: 12 }, position: { x: 3, y: 0 } },
            // Left/Right Pouches
            { id: 'side-pouch-l1', dimensions: { width: 2, height: 4 }, position: { x: 0, y: 4 } },
            { id: 'side-pouch-l2', dimensions: { width: 2, height: 4 }, position: { x: 0, y: 9 } },
            { id: 'side-pouch-r2', dimensions: { width: 2, height: 4 }, position: { x: 12, y: 4 } },
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