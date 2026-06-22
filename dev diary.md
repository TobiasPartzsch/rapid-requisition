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