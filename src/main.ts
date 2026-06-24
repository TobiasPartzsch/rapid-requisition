import { CONTAINER_CATALOG, EQUIPMENT_CATALOG } from "./catalog.js";
import { fillContainerSpatial, replenishContainerSpatial } from "./generator.js";
import { canPlaceItem, getEffectiveDimensions, getInventoryBounds, getOriginFromCenter, initializeInventory, rotateItem, tryPlaceAnywhere } from "./inventory.js";
import { loadSettings, saveSettings } from "./settings.js";
import { GameState, InventoryState, LootGenerationMode } from "./types.js";
import { screenToGrid, UI_CONFIG } from "./view/constants.js";
import { drawInventoryBackground, drawInventoryItems } from "./view/inventoryRenderer.js";
import { drawHeldItem } from "./view/itemRenderer.js";

// 1. Canvas Contexts
const inventoryBgCanvas = document.getElementById("inv-bg-canvas") as HTMLCanvasElement;
const inventoryFgCanvas = document.getElementById("inv-fg-canvas") as HTMLCanvasElement;
const lootBgCanvas = document.getElementById("loot-bg-canvas") as HTMLCanvasElement;
const lootFgCanvas = document.getElementById("loot-fg-canvas") as HTMLCanvasElement;
const interactionCanvas = document.getElementById("interaction-canvas") as HTMLCanvasElement;

const invBgCtx = inventoryBgCanvas.getContext("2d")!;
const invFgCtx = inventoryFgCanvas.getContext("2d")!;
const lootBgCtx = lootBgCanvas.getContext("2d")!;
const lootFgCtx = lootFgCanvas.getContext("2d")!;
const interactionCtx = interactionCanvas.getContext("2d")!;

// 2. Global State
let lastMouseX = 0;
let lastMouseY = 0;

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
    lootSource: initializeInventory(CONTAINER_CATALOG.LOOT_CHEST_LARGE),
    heldItem: null,
    heldItemSource: null,
};

// 3. The Heartbeat (60 FPS)
function gameLoop() {
    syncUI();
    requestAnimationFrame(gameLoop);
}

function syncUI() {
    // Clear dynamic layers
    invFgCtx.clearRect(0, 0, inventoryFgCanvas.width, inventoryFgCanvas.height);
    lootFgCtx.clearRect(0, 0, lootFgCanvas.width, lootFgCanvas.height);
    interactionCtx.clearRect(0, 0, interactionCanvas.width, interactionCanvas.height);

    // Draw inventory items and queue
    drawInventoryItems(invFgCtx, gameState.inventory);
    drawInventoryItems(lootFgCtx, gameState.lootSource);

    // Draw the "Ghost" item on the global overlay
    if (gameState.heldItem) {
        const rect = interactionCanvas.getBoundingClientRect();
        const canvasX = lastMouseX - rect.left;
        const canvasY = lastMouseY - rect.top;
        drawHeldItem(interactionCtx, gameState.heldItem, canvasX, canvasY);
        document.body.style.cursor = "none";
    } else {
        document.body.style.cursor = "default";
    }
}

// 4. Mission Logic
function startMission() {
    const blueprint = EQUIPMENT_CATALOG[currentSettings.selectedGearKey];

    gameState.inventory = initializeInventory(blueprint);
    gameState.lootSource = initializeInventory(CONTAINER_CATALOG.LOOT_CHEST_LARGE);
    gameState.heldItem = null;

    if (currentSettings.mode === LootGenerationMode.LARGE_HAUL) {
        gameState.lootSource = fillContainerSpatial(CONTAINER_CATALOG.LOOT_CHEST_LARGE);
    } else {
        const TARGET_COUNT = 20;
        const currentCount = gameState.lootSource.pockets[0].placedItems.length;
        if (currentCount < TARGET_COUNT) {
            for (let i = 0; i < (TARGET_COUNT - currentCount); i++) {
                gameState.lootSource = replenishContainerSpatial(gameState.lootSource);
            }
        }
    }

    refreshCanvasSizes();
    drawInventoryBackground(invBgCtx, gameState.inventory);
    drawInventoryBackground(lootBgCtx, gameState.lootSource);
}

// 5. Interaction Handlers
function handleInventoryInteraction(
    e: MouseEvent,
    inventory: InventoryState,
    isLootSource: boolean,
) {
    const mouse = screenToGrid(e.offsetX, e.offsetY);

    // Find the pocket under the mouse
    const pocket = inventory.pockets.find(p => {
        const { x, y } = p.definition.position;
        const { width, height } = p.definition.dimensions;
        return mouse.x >= x && mouse.x < x + width &&
            mouse.y >= y && mouse.y < y + height;
    });

    if (!pocket) return;

    const pocketRel = {
        x: mouse.x - pocket.definition.position.x,
        y: mouse.y - pocket.definition.position.y
    };

    if (gameState.heldItem) {
        const origin = getOriginFromCenter(pocketRel.x, pocketRel.y, gameState.heldItem);
        if (canPlaceItem(gameState.heldItem, pocket, origin.x, origin.y)) {
            if (gameState.heldItemSource === 'LOOT_CHEST' && !isLootSource) {
                if (currentSettings.mode === LootGenerationMode.REFILL) {
                    gameState.lootSource = replenishContainerSpatial(gameState.lootSource);
                }
            }

            // We modify the pocket passed in (which is a reference within the state)
            pocket.placedItems = [...pocket.placedItems, {
                item: gameState.heldItem,
                originX: origin.x,
                originY: origin.y,
            }];
            gameState.heldItem = null;
            gameState.heldItemSource = null;
        }
    } else {
        const itemIdx = pocket.placedItems.findIndex(p => {
            const dims = getEffectiveDimensions(p.item);
            return pocketRel.x >= p.originX && pocketRel.x < p.originX + dims.width &&
                pocketRel.y >= p.originY && pocketRel.y < p.originY + dims.height;
        });

        if (itemIdx !== -1) {
            gameState.heldItem = pocket.placedItems[itemIdx].item;
            gameState.heldItemSource = isLootSource ? 'LOOT_CHEST' : 'PLAYER_INVENTORY';
            pocket.placedItems = pocket.placedItems.filter((_, i) => i !== itemIdx);
        }
    }
}

// 6. Event Listeners
window.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener("wheel", () => {
    if (gameState.heldItem) gameState.heldItem = rotateItem(gameState.heldItem);
});

window.addEventListener("contextmenu", (e) => {
    if (gameState.heldItem) {
        e.preventDefault();
        // Attempt to return to the loot source (the chest)
        const newState = tryPlaceAnywhere(gameState.lootSource, gameState.heldItem);

        if (newState) {
            gameState.lootSource = newState;
            gameState.heldItem = null;
            gameState.heldItemSource = null;
        } else {
            // Optional: Provide feedback if the hoard is truly overflowing
            console.warn("No room in the chest to return the item!");
        }
        gameState.heldItem = null;
        gameState.heldItemSource = null;
    }
});

inventoryFgCanvas.addEventListener("click", (e) => {
    handleInventoryInteraction(e, gameState.inventory, false);
});

lootFgCanvas.addEventListener("click", (e) => {
    handleInventoryInteraction(e, gameState.lootSource, true);
});

document.getElementById("btn-start")?.addEventListener("click", startMission);

// 7. Initialization
// Load initial settings
let currentSettings = loadSettings();
initSettings();

function initSettings() {
    const gearSelect = document.getElementById("select-gear") as HTMLSelectElement;
    const modeSelect = document.getElementById("select-mode") as HTMLSelectElement;

    // Populate Gear Select
    Object.keys(EQUIPMENT_CATALOG).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key.replace(/_/g, ' ');
        gearSelect.appendChild(opt);
    });

    // Set initial UI values
    gearSelect.value = currentSettings.selectedGearKey;
    modeSelect.value = currentSettings.mode;

    // Listen for changes
    gearSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, selectedGearKey: gearSelect.value };
        saveSettings(currentSettings);
        applySettings();
    });

    modeSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, mode: modeSelect.value as any };
        saveSettings(currentSettings);
        applySettings();
    });
}

function applySettings() {
    // This updates the game state based on settings
    const blueprint = EQUIPMENT_CATALOG[currentSettings.selectedGearKey as keyof typeof EQUIPMENT_CATALOG];
    gameState.inventory = initializeInventory(blueprint);

    // Refresh the visuals
    refreshCanvasSizes();
    drawInventoryBackground(invBgCtx, gameState.inventory);
}

function refreshCanvasSizes() {
    const { CELL_SIZE, GAP } = UI_CONFIG;
    // Calculate bounds based on the max x+width and y+height
    const invBounds = getInventoryBounds(gameState.inventory);
    const lootBounds = getInventoryBounds(gameState.lootSource);

    // Width and Height should be derived from the actual grid extent
    const invWidth = invBounds.width * (CELL_SIZE + GAP);
    const invHeight = invBounds.height * (CELL_SIZE + GAP);

    inventoryBgCanvas.width = invWidth;
    inventoryBgCanvas.height = invHeight;
    inventoryFgCanvas.width = invWidth;
    inventoryFgCanvas.height = invHeight;

    const lootWidth = lootBounds.width * (CELL_SIZE + GAP);
    const lootHeight = lootBounds.height * (CELL_SIZE + GAP);

    lootBgCanvas.width = lootWidth;
    lootBgCanvas.height = lootHeight;
    lootFgCanvas.width = lootWidth;
    lootFgCanvas.height = lootHeight;

    const arenaEl = document.getElementById("game-arena")!;
    interactionCanvas.width = arenaEl.scrollWidth;
    interactionCanvas.height = arenaEl.scrollHeight;
}

window.addEventListener("resize", () => {
    refreshCanvasSizes();
    drawInventoryBackground(invBgCtx, gameState.inventory);
});

// Setup initial sizes and start loop
refreshCanvasSizes();
applySettings();
requestAnimationFrame(gameLoop);
