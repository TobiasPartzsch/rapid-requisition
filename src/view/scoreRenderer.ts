import { EQUIPMENT_CATALOG } from "../catalog";
import { loadScores } from "../scores";
import { GameMode, HighScore, ScoreBreakdown } from "../types";

// --- Element References ---
const dialog = document.getElementById("score-screen") as HTMLDialogElement;
const titleEl = document.getElementById("score-screen-title") as HTMLElement;
const baseScoreEl = document.getElementById("score-base") as HTMLElement;
const bonusEl = document.getElementById("score-bonus") as HTMLElement;
const totalEl = document.getElementById("score-total") as HTMLElement;
const filterGearSelect = document.getElementById("score-filter-gear") as HTMLSelectElement;
const filterModeSelect = document.getElementById("score-filter-mode") as HTMLSelectElement;
const tableBody = document.getElementById("score-table-body") as HTMLTableSectionElement;
const playAgainBtn = document.getElementById("btn-play-again") as HTMLButtonElement;
const closeBtn = document.getElementById("btn-close-scores") as HTMLButtonElement;
const breakdownSection = document.getElementById("score-breakdown") as HTMLElement;

// --- One-time Setup ---
populateGearFilter();

filterGearSelect.addEventListener("change", refreshTable);
filterModeSelect.addEventListener("change", refreshTable);

// --- Public API ---

export function showScoreScreen(
    breakdown: ScoreBreakdown,
    mode: GameMode,
    gearId: string,
    onPlayAgain: () => void,
    onBackToMenu: () => void,
): void {
    setMode("result");
    const nameInput = document.getElementById("input-player-name") as HTMLInputElement;
    titleEl.textContent = `Mission Complete — ${nameInput.value.trim() || "Anonymous"}`;

    baseScoreEl.textContent = breakdown.baseScore.toString();
    bonusEl.textContent = `+${breakdown.completionBonus}`;
    totalEl.textContent = breakdown.total.toString();

    filterGearSelect.value = gearId;
    filterModeSelect.value = mode;
    // Lock filters to current context
    filterGearSelect.disabled = true;
    filterModeSelect.disabled = true;

    refreshTable();
    openDialog(onPlayAgain, onBackToMenu);
}

export function showScoresBrowser(onClose: () => void): void {
    setMode("browse");
    titleEl.textContent = "High Scores";

    filterGearSelect.disabled = false;
    filterModeSelect.disabled = false;

    refreshTable();
    openDialog(null, onClose);
}

// --- Internal Helpers ---

type DialogMode = "result" | "browse";

function setMode(mode: DialogMode): void {
    const isBrowse = mode === "browse";
    breakdownSection.style.display = isBrowse ? "none" : "";
    playAgainBtn.style.display = isBrowse ? "none" : "";
    closeBtn.textContent = isBrowse ? "Close" : "Back to Menu";
}

function openDialog(
    onPlayAgain: (() => void) | null,
    onClose: () => void,
): void {
    // Replace listeners by cloning - avoids stacking listeners across calls
    const freshPlayAgain = playAgainBtn.cloneNode(true) as HTMLButtonElement;
    const freshClose = closeBtn.cloneNode(true) as HTMLButtonElement;
    playAgainBtn.replaceWith(freshPlayAgain);
    closeBtn.replaceWith(freshClose);

    if (onPlayAgain) {
        freshPlayAgain.addEventListener("click", () => {
            dialog.close();
            onPlayAgain();
        });
    }

    freshClose.addEventListener("click", () => {
        dialog.close();
        onClose();
    });

    dialog.addEventListener("close", onClose, { once: true });
    dialog.showModal();
}

function refreshTable(): void {
    const registry = loadScores();
    const gearId = filterGearSelect.value;
    const mode = filterModeSelect.value as GameMode;
    const scores: readonly HighScore[] = registry[mode][gearId] ?? [];

    tableBody.innerHTML = "";

    if (scores.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "No scores yet.";
        cell.style.textAlign = "center";
        return;
    }

    scores.forEach((entry, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = (index + 1).toString();
        row.insertCell().textContent = entry.playerName;
        row.insertCell().textContent = entry.score.toString();
        row.insertCell().textContent = new Date(entry.timestamp).toLocaleDateString();
    });
}

function populateGearFilter(): void {
    Object.keys(EQUIPMENT_CATALOG).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key.replace(/_/g, " ");
        filterGearSelect.appendChild(opt);
    });
}