Achievements
Hierarchical Domain Model: Successfully separated "Blueprints" (Equipment/Pockets) from "State" (Inventory/Placements). This allows for complex, segmented inventories like tactical vests.
Strict Geometry Engine: Implemented a "Clemency-first" placement validator (canPlaceItem) that respects grid boundaries and prevents overlaps.
Integrated Rotation: Built a rotation mechanic that swaps effective dimensions, allowing 2x1 items to fit into 1x2 slots.
Full Interaction Loop: Completed the "Pickup -> Examine/Rotate -> Requisition/Relocate -> Cancel" cycle using a centered, mouse-following preview.
Modern CD Pipeline: Established an automated GitHub Actions workflow that compiles TypeScript and deploys to GitHub Pages on every push.
Technical Struggles & Solutions
The "Module Export" Hurdle: Resolved browser ReferenceError issues by explicitly configuring the project as an ES Module (type: module and ESNext target).
Immutability vs. Prototype Speed: Navigated the tension of readonly types by shifting from mutation (splice) to functional array patterns (filter/slice), ensuring the "Source of Truth" remains consistent.
The Coordinate Mismatch: Discovered that absolute positioning within CSS Grids requires careful calculation to align with the 32px cell/gap logic.
Deployment Pathing: Fixed 404 errors on GitHub Pages by ensuring script paths are relative (./main.js) to the repository sub-path.
Today's “Wide” Prototype State
[x] Selectable Equipment (Tactical Vest).
[x] Item Generation (Geometrical placeholders).
[x] Click-to-pickup from Loot Queue.
[x] Mousewheel to rotate.
[x] Validated placement in specific pockets.
[x] "Lift and Relocate" from inventory.
[x] Right-click to cancel back to queue.

### Session 2: The Great Engine Migration (DOM to Canvas)

#### Achievements
- **Dual-Layer Canvas Pipeline**: Transitioned from a "DOM-heavy" architecture to a high-performance multi-canvas system. Separated static infrastructure (Background Grid) from high-frequency updates (Foreground Items) to optimize render cycles.
- **Global Interaction Overlay**: Implemented a "Ghost" rendering layer that covers the entire viewport. This allows the "Held Item" to glide seamlessly between disconnected UI regions (Queue vs. Inventory) without clipping.
- **Unidirectional State Synchronization**: Established a 60fps heartbeat using `requestAnimationFrame`. The UI is now a pure reflection of the `GameState`, eliminating the "Zombie DOM" bugs where the visual state drifted from the data.
- **Probabilistic Loot Sourcing**: Replaced hard-coded placeholders with a dynamic generator. Implemented a Cubed Probability Distribution ($x^3$) to skew results toward smaller, manageable items, while using the Golden Ratio Conjugate to derive accessible HSL colors from item dimensions.
- **Vite-Powered Workflow**: Integrated Vite into the dev pipeline to handle real-time TypeScript compilation, banishing the 404 "Module Not Found" errors and streamlining the local development loop.

#### Technical Struggles & Solutions
- **The "Coordinate Translation" Riddle**: Solved the challenge of "Screen-to-World" mapping. Since we no longer have individual DOM event listeners, I built a translation helper that maps global `clientX/Y` into relative `Grid X/Y` coordinates based on UI regional offsets.
- **Bitmap Persistence**: Addressed the "Vanishing Grid" issue by decoupling the background draw call. The grid is now "cached" on the background canvas and only redrawn when the equipment blueprint changes.
- **Non-Uniform Queue Hit-Testing**: Developed a spatial search algorithm for the Loot Queue. Since items vary in height, the engine now iterates through the vertical stack to determine which item index "intercepted" the mouse click.
- **Statistical Variance in Testing**: Fine-tuned Vitest assertions to account for the probabilistic nature of the cubed distribution, ensuring tests are robust enough to handle the occasional "unlucky" random seed.

#### Today's “Engineered” Prototype State
[x] Integrated Vite build/dev toolchain.
[x] Multi-layered Canvas rendering (BG/FG/Overlay).
[x] Cubed-distribution loot generator with HSL color logic.
[x] Centralized `syncUI` logic via `requestAnimationFrame`.
[x] Regional hit-detection (Inventory vs. Queue coordinates).
[x] Global mouse "Ghosting" across all UI regions.

### Session 3: Persistence, Scale, and Coordinate Normalization

#### Achievements
- **Persistent State Vault**: Architected a typed `localStorage` synchronization layer for `GameSettings`. Implemented JSON serialization with a "Safe-Fail" default merge pattern to ensure schema evolution doesn't corrupt the player's hoard.
- **Dynamic Bounding-Box Calculation**: Developed a "Logical-to-Physical" mapping engine that calculates the absolute grid bounds of multi-pocket equipment. This allows the canvas and renderer to dynamically resize and normalize coordinates based on non-uniform pocket placements.
- **Symmetric Centroid Anchoring**: Refactored the drag-and-drop "Pivot Point." The system now translates the mouse position into a centered origin, allowing items to "hang" naturally from the cursor rather than dragging by the top-left corner.
- **Relational View Scoping**: Scoped the interaction overlay to the specific "Game Arena" region. This prevents "Ghost Item" leakage into the settings panel while maintaining seamless movement between the source queue and the inventory targets.
- **High-Fidelity Kit Blueprinting**: Expanded the `EQUIPMENT_CATALOG` to support complex raid gear. The engine now successfully manages and renders disjointed pocket groups (Backpack, Plate Carrier, and Mag Pouches) as a single logical `InventoryState`.

#### Technical Struggles & Solutions
- **The "Mirror Image" Illusion**: Diagnosed a 404/MIME-type conflict on GitHub Pages caused by stale deployment sources. Resolved by migrating the CI/CD pipeline from "Branch Deployment" to "GitHub Actions" and explicitly defining the `base` path in `vite.config.ts`.
- **Negative Coordinate Displacement**: Encountered clipping issues when pockets were defined with negative offsets. Solution was to normalize the data hoard to a `(0,0)` origin, simplifying the hit-detection math and removing redundant renderer translation offsets.
- **Immutability Assignment Ghosting**: Debugged a "Silent Replenishment" failure where the state was being calculated but not re-assigned. Reinforced the unidirectional flow by ensuring `gameState.lootQueue` is explicitly updated with the return value of the replenishment pure function.
- **Z-Index Layer Conflict**: Fixed a layout bug where the interaction canvas was occupying a flex-box slot and displacing the UI. Resolved via absolute positioning within a relative-anchored "Arena" container.

#### Today's “Engineered” Prototype State
[x] GitHub Actions CI/CD pipeline with Vite-specific base paths.
[x] LocalStorage-backed settings persistence.
[x] Dynamic multi-pocket coordinate system (Raid Gear support).
[x] Automatic Loot Replenishment (Static Minimum logic).
[x] Centered-cursor item placement and improved rotation collision.
[x] Regionalized Interaction Overlay (No-leak ghosting).

### Session 4: The Spatial Hoard and Unified Interaction

#### Achievements
- **Spatial Loot Sovereignty**: Successfully replaced the linear "Loot Queue" with a fully realized 30x20 spatial "Loot Chest." The source of items is now a  first-class InventoryState object, governed by the same grid rules as the player's gear.
- **Polymorphic Interaction Strategy**: Refactored the click-handling engine to be inventory-agnostic. By passing the target InventoryState as a parameter, the same logic now manages both the player's tactical vest and the external loot chest, drastically reducing code duplication (DRY).
- **Greedy Spatial Generator**: Developed a "First-Fit" packing algorithm for the LARGE_HAUL mode. The engine now populates the 600-cell chest grid by probabilistically attempting to pack generated items into available voids.
- **Origin-Aware Replenishment**: Implemented a "Conservation of Loot" tracker. The system now distinguishes between "Internal Reordering" and "Cross-Container Transfers," triggering a random-spot refill in the chest only when an item is successfully relocated to the player's inventory.
- **Redundant Rotation Inputs**: Expanded the accessibility of the rotation mechanic. In addition to the mousewheel, the engine now listens for [R] and [Space] keydown events, providing a more responsive feel during high-speed requisitioning.

#### Technical Struggles & Solutions
- **The "Vellum" Overwrite Bug**: Diagnosed a rendering issue where items were "ghosting" (persisting) after being picked up. Solution: Explicitly clearing the specific Foreground Context of the loot chest during the syncUI heartbeat, ensuring the canvas doesn't retain stale pixel data.
- **Canvas Context Cross-Wiring**: Resolved a copy-paste regression where the Loot Chest was drawing into the Inventory's context. Reinforced strict variable naming for invBgCtx vs. lootBgCtx to ensure logical separation of the two arenas.
- **The "Resize-Reset" Trap**: Addressed a bug where canvases appeared blank or tiny after a mission start. Re-ordered the initialization sequence to ensure refreshCanvasSizes() resets the physical pixel dimensions before the static background draw calls are issued.
- **Coordinate Normalization**: Verified that e.offsetX/Y remains localized to the specific canvas being clicked, allowing the generic interaction handler to function without complex global-to-local translation math.

#### Today's “Engineered” Prototype State
[x] 30x20 Large Loot Chest (Spatial source).
[x] Unified handleInventoryInteraction for all containers.
[x] "First-Fit" greedy spatial loot generation.
[x] Event-driven replenishment (Refill on drop-in-bag).
[x] Keyboard-based rotation (R and Space).
[x] Multi-context canvas clearing (No ghosting).

### Session 5: Extraction Logic and Stochastic Packing
#### Achievements
- **Dual-Mode Scoring Engine**: Architected a scoreCalculator that balances volume, time, and density. Implemented two distinct playstyles: TIME_ATTACK (speed-focused) and COUNTDOWN (efficiency-focused).
- **Stochastic "Fail-Fast" Generation**: Refactored the loot chest filler from a "Greedy Grid" to a "Stochastic Actor" model. The generator now attempts to "shove" items into the chest with 10-failure-threshold logic, resulting in a more natural, hand-packed look.
- **Unified Score Registry**: Implemented a deep-merged localStorage high-score system. Each leaderboard is dynamically keyed by both ScoringMode and GearID, ensuring a "Hip Bag" run never has to compete with a "Raid Kit" score.
- **Mission Lifecycle Management**: Integrated a "Signal Extraction" workflow. The engine now tracks startTime and endTime, stopping the clock and calculating a tiered ScoreBreakdown (Base, Time Bonus, Density Multiplier) upon extraction.
- **Dynamic Inventory Catalog**: Expanded the tactical toolkit with intermediate gear, including the Operator Vest (fragmented pocket challenge) and the Messenger Satchel (landscape-skewed puzzle).
#### Technical Struggles & Solutions
- **The "Rotation-Blind" Generator**: Discovered that the generator was giving up too early because it didn't try rotating items. Solved by granting the generator "Actor Agency"—it now attempts both orientations before counting a failure, significantly increasing chest density.
- **Schema Evolution Protection**: Addressed the risk of "Registry Corruption" when adding new gear. Developed a load-time merge pattern that ensures new EQUIPMENT_CATALOG entries are automatically initialized in the player's existing high-score data.
- **Context-Switching Errors**: Resolved a TypeError in the scoring logic where the engine was looking for blueprints using the wrong ID mapping. Refactored to use the state's pockets directly, removing the fragile lookup dependency.
- **The "Zombie Timer" Flicker**: Fixed a UI bug where the timer would briefly display the previous run's time. Synchronized the startTime reset with the DOM text update in the startMission sequence.
#### Today's “Engineered” Prototype State
[x] TIME_ATTACK and COUNTDOWN game modes.
[x] Persistent Top-10 High Score tables for every gear type.
[x] Live-updating Mission Timer with mode-specific logic.
[x] "Stochastic" Loot Chest generation (High-density natural packing).
[x] Mission end-state triggers (Full bag / Empty chest / Time's up).
[x] Five distinct (para)military equipment blueprints.

### Session 6: Visual Overhaul and Generation Hardening
#### Achievements
- **Tactical Aesthetic**: Replaced placeholder styling with a full military theme. Soft warm neutral body background, Bundeswehr Flecktarn tiling texture for the game arena, metallic gradient border for the loot chest, and khaki border with dark interior for the player inventory.
- **Pronounced Mission HUD**: Redesigned the header with a dark gradient background, gold stencil title, green monospace timer with glow effect, and styled Start/Extract buttons with hover transitions.
- **Settings Panel Rework**: Restyled the settings panel with a dark tactical theme and grouped setting sections. Extended with grid cell size selector and per-game-mode scoring rule options (points per cell, perfect fill bonus, time multiplier, rotation penalty).
- **Asset Attribution**: Added mixed-license documentation to README, distinguishing MIT (code) from CC BY-SA 3.0 (Flecktarn texture, pixelFire via Wikimedia Commons).

#### Technical Struggles & Solutions
- **Flecktarn CSS Approximation**: Attempted a pure CSS radial-gradient camo pattern -- visually unconvincing. Replaced with a tiling raster texture served from Vite's `public/` directory.
- **Vite Public Asset 404**: Texture served a 404 despite correct file placement. Root cause was a missing explicit `publicDir` declaration in `vite.config.ts`. Adding it resolved the issue.
- **Oversized Loot Generation**: Items were being generated up to 30×20 cells. Root cause: `fillContainerSpatial` passed the loot chest inventory as the generation constraint source instead of the player inventory. Refactored generator to accept a separate `constraintSource: InventoryState`, ensuring items are always bounded by the largest player pocket dimensions.
- **Settings Initialisation Bug**: Game mode dropdown was not pre-selected on startup due to a copy-paste error assigning `currentSettings.lootMode` to `gameModeSelect.value`. Fixed alongside a missing initialisation of the loot mode select.
- **Return-to-Chest Rotation**: Items returned via right-click were failing to place if the chest was nearly full. Extended the cancel handler to attempt the rotated orientation via `??` chaining, consistent with the existing generator pattern.

#### Today's "Engineered" Prototype State
[x] Full military visual theme with tiling Flecktarn texture.
[x] Styled HUD with mode-aware timer, tactical buttons, and settings panel.
[x] Loot generation correctly constrained to player inventory pocket dimensions.
[x] All settings dropdowns correctly initialised from saved state on load.
[x] Rotation fallback on item return to loot chest.

### Session 6: Settings Architecture and UI Wiring
#### Achievements
- **Dynamic Cell Size**: Migrated CELL_SIZE from a module constant to a
  GameSettings parameter, threading it through the render pipeline.
- **Per-Mode Scoring Settings**: Replaced hardcoded scoring values with
  structured countdownScoring and timeAttackScoring objects in GameSettings.
- **Snap Assist**: Implemented a 1-cell radius grid search in findSnapOrigin
  for forgiving item placement.
- **Scoring UI**: Wired dropdown selects to scoring settings with proper
  parseInt handling on read.

#### Technical Struggles & Solutions
- **NaN in Score Calculations**: select.value returns strings; resolved by
  applying parseInt() at the read site.
- **Stale localStorage**: Old settings schema caused dropdowns to show nothing
  selected. Identified version mismatch as root cause; localStorage.clear()
  restores defaults. Schema versioning noted as future hardening task.
- **HTML Nesting Bugs**: Corrected improper aside/main nesting that was
  breaking layout.

#### Prototype State
[x] All Session 5 items
[x] Configurable cell size via settings
[x] Per-mode scoring rules (points/cell, time bonus, completion bonus)
[x] Snap assist for item placement
[x] Scoring settings UI with persistent localStorage storage