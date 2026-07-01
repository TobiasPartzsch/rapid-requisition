import { CONTAINER_CATALOG, EQUIPMENT_CATALOG } from "./catalog.js";
import { fillContainerSpatial, replenishContainerSpatial } from "./generator.js";
import { findSnapOrigin, getEffectiveDimensions, getInventoryBounds, getOriginFromCenter, initializeInventory, rotateItem, tryPlaceAnywhere } from "./inventory.js";
import { calculateScore, countOccupiedCells, countTotalCapacityFromPockets } from "./scoreCalculator.js";
import { saveScore } from "./scores.js";
import { loadPilotName, loadSettings, savePilotName, saveSettings } from "./settings.js";
import { GameMode, GameState, InventoryState, LootGenerationMode } from "./types.js";
import { screenToGrid, UI_CONFIG } from "./view/constants.js";
import { drawInventoryBackground, drawInventoryItems } from "./view/inventoryRenderer.js";
import { drawHeldItem } from "./view/itemRenderer.js";
import { showScoresBrowser, showScoreScreen } from "./view/scoreRenderer.js";

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

const timerEl = document.getElementById("timer") as HTMLElement;
const lootGenerationModeSelect = document.getElementById("select-lootmode") as HTMLSelectElement
const gameModeSelect = document.getElementById("select-gamemode") as HTMLSelectElement
const gearSelect = document.getElementById("select-gear") as HTMLSelectElement;
const countdownPointsSelect = document.getElementById("select-countdown-points-per-cell") as HTMLSelectElement;
const timeBonusPerSecondSelect = document.getElementById("select-time-bonus-per-second") as HTMLSelectElement;
const timeAttackPointsSelect = document.getElementById("select-timeattack-points-per-cell") as HTMLSelectElement;
const completionBonusSelect = document.getElementById("select-completion-bonus") as HTMLSelectElement;
const cellSizeSelect = document.getElementById("select-cellsize") as HTMLSelectElement;
const nameInput = document.getElementById("input-player-name") as HTMLInputElement;

// 2. Global State
let lastMouseX = 0;
let lastMouseY = 0;

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.HIP_BAG),
    lootSource: initializeInventory(CONTAINER_CATALOG.LOOT_CHEST_LARGE),
    heldItem: null,
    heldItemSource: null,
    startTime: null,
    endTime: null,
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
    const cellSize = currentSettings.cellSize
    drawInventoryItems(invFgCtx, gameState.inventory, cellSize);
    drawInventoryItems(lootFgCtx, gameState.lootSource, cellSize);

    // Draw the "Ghost" item on the global overlay
    if (gameState.heldItem) {
        const rect = interactionCanvas.getBoundingClientRect();
        const canvasX = lastMouseX - rect.left;
        const canvasY = lastMouseY - rect.top;
        drawHeldItem(interactionCtx, gameState.heldItem, canvasX, canvasY, cellSize);
        document.body.style.cursor = "none";
    } else {
        document.body.style.cursor = "default";
    }

    // Timer update
    if (!gameState.startTime) {
        timerEl.textContent = "--:--";
        return
    }
    const mode = currentSettings.gameMode;
    const elapsedMs = Date.now() - gameState.startTime;

    if (mode === GameMode.COUNTDOWN) {
        const limitMs = (currentSettings.timeLimitSeconds || 60) * 1000;
        const remainingMs = Math.max(0, limitMs - elapsedMs);
        timerEl.textContent = formatTime(remainingMs);

        if (remainingMs <= 0) signalExtraction(); // Time's up!
    } else {
        timerEl.textContent = formatTime(elapsedMs);
    }
}

// 4. Mission Logic
function startMission() {
    const blueprint = EQUIPMENT_CATALOG[currentSettings.selectedGearKey];

    gameState.inventory = initializeInventory(blueprint);
    gameState.lootSource = initializeInventory(CONTAINER_CATALOG.LOOT_CHEST_LARGE);
    gameState.heldItem = null;

    gameState.startTime = Date.now();
    gameState.endTime = null;

    timerEl.textContent = currentSettings.gameMode === GameMode.COUNTDOWN
        ? formatTime(currentSettings.timeLimitSeconds * 1000)
        : "00:00";

    if (currentSettings.lootMode === LootGenerationMode.LARGE_HAUL) {
        gameState.lootSource = fillContainerSpatial(
            CONTAINER_CATALOG.LOOT_CHEST_LARGE,
            gameState.inventory
        );
    } else {
        const TARGET_COUNT = 20;
        const currentCount = gameState.lootSource.pockets[0].placedItems.length;
        if (currentCount < TARGET_COUNT) {
            for (let i = 0; i < (TARGET_COUNT - currentCount); i++) {
                gameState.lootSource = replenishContainerSpatial(
                    gameState.lootSource,
                    gameState.inventory
                );
            }
        }
    }

    refreshCanvasSizes();
    const cellSize = currentSettings.cellSize
    drawInventoryBackground(invBgCtx, gameState.inventory, cellSize);
    drawInventoryBackground(lootBgCtx, gameState.lootSource, cellSize);

    document.getElementById("btn-start")!.style.display = "none";
    document.getElementById("btn-extract")!.style.display = "inline-block";
}

function signalExtraction() {
    if (!gameState.startTime || gameState.endTime) return;

    gameState.endTime = Date.now();
    const elapsedSeconds = (gameState.endTime - gameState.startTime) / 1000;

    const scoreBreakdown = calculateScore(
        currentSettings.gameMode,
        gameState,
        elapsedSeconds,
        currentSettings.countdownScoring,
        currentSettings.timeAttackScoring,
        currentSettings.timeLimitSeconds,
    );

    saveScore(currentSettings.gameMode, currentSettings.selectedGearKey, {
        playerName: nameInput.value.trim() || "Anonymous",
        score: scoreBreakdown.total,
        timestamp: Date.now(),
        gearId: currentSettings.selectedGearKey,
        gameMode: currentSettings.gameMode,
    });

    gameState.startTime = null;
    gameState.endTime = null;

    document.getElementById("btn-start")!.style.display = "inline-block";
    document.getElementById("btn-extract")!.style.display = "none";

    showScoreScreen(
        scoreBreakdown,
        currentSettings.gameMode,
        currentSettings.selectedGearKey,
        () => startMission(),
        () => { },
    );
}

// 5. Interaction Handlers
function handleInventoryInteraction(
    e: MouseEvent,
    inventory: InventoryState,
    isLootSource: boolean,
) {
    if (!gameState.startTime) return;

    const mouse = screenToGrid(e.offsetX, e.offsetY, currentSettings.cellSize);

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
        const baseOrigin = getOriginFromCenter(pocketRel.x, pocketRel.y, gameState.heldItem);
        const origin = findSnapOrigin(gameState.heldItem, pocket, baseOrigin);
        if (origin) {
            if (gameState.heldItemSource === 'LOOT_CHEST' && !isLootSource) {
                if (currentSettings.lootMode === LootGenerationMode.REFILL) {
                    gameState.lootSource = replenishContainerSpatial(
                        gameState.lootSource,
                        gameState.inventory
                    );
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

    checkAutoEndConditions()
}

function checkAutoEndConditions() {
    if (!gameState.startTime || gameState.endTime) return;

    const isInventoryFull = countOccupiedCells(gameState.inventory) ===
        countTotalCapacityFromPockets(gameState.inventory.pockets);

    const isLootExhausted = gameState.lootSource.pockets.every(p => p.placedItems.length === 0);

    if (isInventoryFull || isLootExhausted) {
        console.log("Extraction forced: Objectives complete.");
        signalExtraction();
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
window.addEventListener("keydown", (e) => {
    if (!gameState.heldItem) return;

    if (e.key.toLowerCase() === "r" || e.key === " ") {
        if (e.key === " ") e.preventDefault();

        gameState.heldItem = rotateItem(gameState.heldItem);
    }
});

window.addEventListener("contextmenu", (e) => {
    if (gameState.heldItem) {
        e.preventDefault();
        // Attempt to return to the loot source (the chest), also try the rotated version
        const newState =
            tryPlaceAnywhere(gameState.lootSource, gameState.heldItem) ??
            tryPlaceAnywhere(gameState.lootSource, rotateItem(gameState.heldItem));

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
document.getElementById("btn-extract")?.addEventListener("click", signalExtraction);
document.getElementById("btn-view-scores")?.addEventListener("click", () => {
    showScoresBrowser(() => { });
});

function initSettings() {
    // Populate Gear Select
    Object.keys(EQUIPMENT_CATALOG).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key.replace(/_/g, ' ');
        gearSelect.appendChild(opt);
    });

    // Set initial UI values
    gearSelect.value = currentSettings.selectedGearKey;
    gameModeSelect.value = currentSettings.gameMode;
    lootGenerationModeSelect.value = currentSettings.lootMode;
    countdownPointsSelect.value = currentSettings.countdownScoring.pointsPerCell.toString();
    timeBonusPerSecondSelect.value = currentSettings.countdownScoring.timeBonusPerSecond.toString();
    timeAttackPointsSelect.value = currentSettings.timeAttackScoring.pointsPerCell.toString();
    completionBonusSelect.value = currentSettings.timeAttackScoring.completionBonus.toString();

    updateScoringVisibility(currentSettings.gameMode)

    // Listen for changes
    gearSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, selectedGearKey: gearSelect.value };
        saveSettings(currentSettings);
        applySettings();
        if (gameState.startTime) {
            signalExtraction();
        }
    });
    lootGenerationModeSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, lootMode: lootGenerationModeSelect.value as LootGenerationMode };
        saveSettings(currentSettings);
        applySettings();
        if (gameState.startTime) {
            signalExtraction();
        }
    });
    gameModeSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, gameMode: gameModeSelect.value as GameMode };
        saveSettings(currentSettings);
        applySettings();
        if (gameState.startTime) {
            signalExtraction();
        }
        updateScoringVisibility(currentSettings.gameMode)
    });
    countdownPointsSelect.addEventListener("change", () => {
        currentSettings = {
            ...currentSettings,
            countdownScoring: {
                ...currentSettings.countdownScoring,
                pointsPerCell: parseInt(countdownPointsSelect.value)
            }
        };
        saveSettings(currentSettings);
        if (gameState.startTime) signalExtraction();
    });
    timeBonusPerSecondSelect.addEventListener("change", () => {
        currentSettings = {
            ...currentSettings,
            countdownScoring: {
                ...currentSettings.countdownScoring,
                timeBonusPerSecond: parseInt(timeBonusPerSecondSelect.value)
            }
        };
        saveSettings(currentSettings);
        if (gameState.startTime) signalExtraction();
    });
    timeAttackPointsSelect.addEventListener("change", () => {
        currentSettings = {
            ...currentSettings,
            timeAttackScoring: {
                ...currentSettings.timeAttackScoring,
                pointsPerCell: parseInt(timeAttackPointsSelect.value)
            }
        };
        saveSettings(currentSettings);
        if (gameState.startTime) signalExtraction();
    });
    completionBonusSelect.addEventListener("change", () => {
        currentSettings = {
            ...currentSettings,
            timeAttackScoring: {
                ...currentSettings.timeAttackScoring,
                completionBonus: parseInt(completionBonusSelect.value)
            }
        };
        saveSettings(currentSettings);
        if (gameState.startTime) signalExtraction();
    });

    cellSizeSelect.value = currentSettings.cellSize.toString();

    cellSizeSelect.addEventListener("change", () => {
        currentSettings = { ...currentSettings, cellSize: parseInt(cellSizeSelect.value) };
        saveSettings(currentSettings);
        applySettings();
    });
}

nameInput.value = loadPilotName();
nameInput.addEventListener("change", () => savePilotName(nameInput.value.trim()));

function applySettings() {
    // This updates the game state based on settings
    const key = currentSettings.selectedGearKey;
    const blueprint = EQUIPMENT_CATALOG[key];
    gameState.inventory = initializeInventory(blueprint);

    if (!blueprint) {
        console.error(`Missing blueprint for key: ${key}`);
        return;
    }

    // Refresh the visuals
    refreshCanvasSizes();
    const cellSize = currentSettings.cellSize
    drawInventoryBackground(invBgCtx, gameState.inventory, cellSize);
    drawInventoryBackground(lootBgCtx, gameState.lootSource, cellSize);
}

function refreshCanvasSizes() {
    const { GAP } = UI_CONFIG;
    // Calculate bounds based on the max x+width and y+height
    const invBounds = getInventoryBounds(gameState.inventory);
    const lootBounds = getInventoryBounds(gameState.lootSource);
    const cellSize = currentSettings.cellSize

    // Width and Height should be derived from the actual grid extent
    const invWidth = invBounds.width * (cellSize + GAP);
    const invHeight = invBounds.height * (cellSize + GAP);

    inventoryBgCanvas.width = invWidth;
    inventoryBgCanvas.height = invHeight;
    inventoryFgCanvas.width = invWidth;
    inventoryFgCanvas.height = invHeight;

    const lootWidth = lootBounds.width * (cellSize + GAP);
    const lootHeight = lootBounds.height * (cellSize + GAP);

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
    drawInventoryBackground(invBgCtx, gameState.inventory, currentSettings.cellSize);
});

// Setup initial sizes and start loop
let currentSettings = loadSettings();
initSettings();

requestAnimationFrame(() => {
    applySettings();
    gameLoop();
});

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // String.padStart ensures we keep the 00:00 format
    const mDisplay = minutes.toString().padStart(2, '0');
    const sDisplay = seconds.toString().padStart(2, '0');

    return `${mDisplay}:${sDisplay}`;
}

function updateScoringVisibility(mode: GameMode) {
    const countdownEl = document.getElementById("scoring-countdown")!;
    const timeAttackEl = document.getElementById("scoring-timeattack")!;
    countdownEl.style.display = mode === GameMode.COUNTDOWN ? "block" : "none";
    timeAttackEl.style.display = mode === GameMode.TIME_ATTACK ? "block" : "none";
}
