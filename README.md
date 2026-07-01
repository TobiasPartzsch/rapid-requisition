# Rapid Requisition

**[Play it here](https://tobiaspartzsch.github.io/rapid-requisition/)**

A browser-based inventory puzzle game. Pack tactical gear into a limited grid
as efficiently as possible before time runs out.
Inspired by the inventory management of looter shooters, simplified down to a
geometric puzzle.

## How to Play

Drag items from the loot chest (left) into your gear (right) by clicking to pick
up and clicking again to place. Items can be rotated with the scroll wheel, `R`,
or `Space`. Right-click cancels a held item and returns it to the chest.

Enter your pilot name in the top-left to save scores to the leaderboard.

## Game Modes

### Countdown
Pack as much as possible before the clock hits zero. A full clear awards a time
bonus based on how many seconds remain.

**Score = (cells filled × points per cell) + (seconds remaining × time bonus per second)**

### Time Attack
Pack the inventory as fast as possible. A full clear awards a completion bonus,
scaled by how much faster than the expected time you finished.

**Score = (cells filled × points per cell) + base completion bonus + (seconds ahead of expectation × time bonus per second)**

A partial pack still scores points per cell — the completion bonus only applies
on a full clear.

## Settings

All settings are adjustable from the in-game panel before or during a mission.
Changing a setting mid-mission triggers an early extraction.

| Setting | Description |
|---|---|
| Gear | The equipment loadout to fill. Affects grid layout and capacity. |
| Loot Mode | **Endless Stream**: items refill as you pack. **Single Large Haul**: fixed pool of loot. |
| Game Mode | Countdown or Time Attack (see above). |
| Grid Cell Size | Visual size of each grid cell. Small (20px) is recommended for screens below 1080p. |
| Points per Cell | Base points awarded per filled cell. |
| Time Bonus / Base Bonus | See scoring formulas above. |
| Expected Seconds per Cell | Time Attack only. Sets the baseline expectation for scoring. Adjust to taste. |

> **Note:** This game was developed on a 1080p display. The Standard (30px) cell
> size is recommended at that resolution. Use Small (20px) for smaller screens.

## Running Locally

1. Clone the repo: `git clone <url>`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Future Ideas

- Containers within containers
- Real item system with categories, value and weight
- Sprite-based items instead of solid colours
- Improved colour distribution for items with similar areas but different shapes
- Sound effects
- Colour-blind modes (user-defined palette)
- Move and rotation penalty scoring
- Sequential chest mode: open chests until time runs out or you extract, with a
  risk of losing everything
- Per-gear expected completion time for Time Attack, accounting for pocket
  fragmentation. Requires playtesting data.

## License

Code: MIT  
Flecktarn texture: [pixelFire](https://commons.wikimedia.org/w/index.php?curid=21884), CC BY-SA 3.0