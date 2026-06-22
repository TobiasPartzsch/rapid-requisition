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
};