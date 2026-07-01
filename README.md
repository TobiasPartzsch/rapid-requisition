# Rapid Requisition

**[Play it here](https://yourusername.github.io/rapid-requisition/)**

A browser-based inventory puzzle game. Pack tactical gear into a limited grid
as efficiently as possible before time runs out.

## Modes
- **Countdown**: Maximize score before the clock hits zero.
- **Time Attack**: Pack the inventory as fast as possible.

## How to Run

### Play Online
[Live demo](https://yourusername.github.io/rapid-requisition/)

### Run Locally
1. Clone the repo: `git clone <url>`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Settings
Adjust grid size, scoring rules, and gear loadout from the in-game settings panel.

## Future Ideas
- countainers (within containers)
- real item system with categories, value, weight and such
- use real pictures instead of color
- the color calculation seems to not be perfect. items with quite different shapes (3x8 and 3x1 for example) end up with very similar colors
- sound
- let the user define the forbidden colors (color-blind modes?)
- penalize number of moves and rotations
- have a game mode where you open a sequence of chests with random loot until time runs out or you extract. Maybe with a random chance to get killed and lose everything

## License
Code: MIT  
Flecktarn texture: [pixelFire](https://commons.wikimedia.org/w/index.php?curid=21884), CC BY-SA 3.0