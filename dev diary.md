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