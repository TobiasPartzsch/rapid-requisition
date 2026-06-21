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