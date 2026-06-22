import { EQUIPMENT_CATALOG } from "./catalog.js";
import { generateLootForInventory, replenishLootQueue } from "./generator.js";
import { canPlaceItem, getEffectiveDimensions, getOriginFromCenter, initializeInventory, rotateItem } from "./inventory.js";
import { GameState } from "./types.js";
import { screenToGrid } from "./view/constants.js";
import { drawInventoryBackground, drawInventoryItems } from "./view/inventoryRenderer.js";
import { drawHeldItem } from "./view/itemRenderer.js";
import { drawLootQueue, getItemAtPosition } from "./view/lootQueueRenderer.js";

// 1. Canvas Contexts
const inventoryBgCanvas = document.getElementById("bg-canvas") as HTMLCanvasElement;
const inventoryFgCanvas = document.getElementById("fg-canvas") as HTMLCanvasElement;
const queueCanvas = document.getElementById("queue-canvas") as HTMLCanvasElement;
const interactionCanvas = document.getElementById("interaction-canvas") as HTMLCanvasElement;

const bgCtx = inventoryBgCanvas.getContext("2d")!;
const fgCtx = inventoryFgCanvas.getContext("2d")!;
const queueCtx = queueCanvas.getContext("2d")!;
const interactionCtx = interactionCanvas.getContext("2d")!;

// 2. Global State
let lastMouseX = 0;
let lastMouseY = 0;

let gameState: GameState = {
    inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
    heldItem: null,
    lootQueue: [],
};

// 3. The Heartbeat (60 FPS)
function gameLoop() {
    syncUI();
    requestAnimationFrame(gameLoop);
}

function syncUI() {
    // Clear dynamic layers
    fgCtx.clearRect(0, 0, inventoryFgCanvas.width, inventoryFgCanvas.height);
    queueCtx.clearRect(0, 0, queueCanvas.width, queueCanvas.height);
    interactionCtx.clearRect(0, 0, interactionCanvas.width, interactionCanvas.height);

    // Draw inventory items and queue
    drawInventoryItems(fgCtx, gameState.inventory);
    drawLootQueue(queueCtx, gameState.lootQueue);

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
    gameState = {
        ...gameState,
        inventory: initializeInventory(EQUIPMENT_CATALOG.TACTICAL_VEST),
        heldItem: null,
        lootQueue: Array.from({ length: 5 }, () =>
            generateLootForInventory(gameState.inventory)
        )
    };
    // The background only needs to draw when gear or size changes
    drawInventoryBackground(bgCtx, gameState.inventory);
}

// 5. Interaction Handlers
function handleInventoryClick(e: MouseEvent) {
    const mouse = screenToGrid(e.offsetX, e.offsetY);
    const pocket = gameState.inventory.pockets.find(p => {
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
        // Use our new helper to find where the top-left should be
        const origin = getOriginFromCenter(pocketRel.x, pocketRel.y, gameState.heldItem);
        if (canPlaceItem(gameState.heldItem, pocket, origin.x, origin.y)) {
            pocket.placedItems = [...pocket.placedItems, {
                item: gameState.heldItem,
                originX: origin.x, originY: origin.y,
            }];
            gameState.heldItem = null;
            gameState.lootQueue = replenishLootQueue(
                gameState.lootQueue,
                gameState.inventory,
            );
        }
    } else {
        const itemIdx = pocket.placedItems.findIndex(p => {
            const dims = getEffectiveDimensions(p.item);
            return pocketRel.x >= p.originX && pocketRel.x < p.originX + dims.width &&
                pocketRel.y >= p.originY && pocketRel.y < p.originY + dims.height;
        });

        if (itemIdx !== -1) {
            gameState.heldItem = pocket.placedItems[itemIdx].item;
            pocket.placedItems = pocket.placedItems.filter((_, i) => i !== itemIdx);
        }
    }
}

function handleQueueClick(e: MouseEvent) {
    if (gameState.heldItem) return;
    const idx = getItemAtPosition(gameState.lootQueue, e.offsetX, e.offsetY);
    if (idx !== -1) {
        gameState.heldItem = gameState.lootQueue[idx];
        gameState.lootQueue = gameState.lootQueue.filter((_, i) => i !== idx);
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
        gameState.lootQueue = [...gameState.lootQueue, gameState.heldItem];
        gameState.heldItem = null;
    }
});

inventoryFgCanvas.addEventListener("click", handleInventoryClick);
queueCanvas.addEventListener("click", handleQueueClick);
document.getElementById("btn-start")?.addEventListener("click", startMission);

// 7. Initialization
function refreshCanvasSizes() {
    const mainEl = document.querySelector("main")!;
    const rect = mainEl.getBoundingClientRect();

    // Global Overlay covers everything
    interactionCanvas.width = rect.width;
    interactionCanvas.height = rect.height;

    // The Inventory and Queue need enough space for their content
    // We can set these to a fixed size based on the catalog or just 
    // give them a healthy default for now.
    inventoryBgCanvas.width = 400;
    inventoryBgCanvas.height = 600;
    inventoryFgCanvas.width = 400;
    inventoryFgCanvas.height = 600;
    queueCanvas.width = 200;
    queueCanvas.height = 600;
}

window.addEventListener("resize", () => {
    refreshCanvasSizes();
    drawInventoryBackground(bgCtx, gameState.inventory);
});

// Setup initial sizes and start loop
refreshCanvasSizes();
requestAnimationFrame(gameLoop);