# Floor Model Notes

## Recommended Representation

For this front-end, the most reliable way to keep the plan visually exact is:

1. Use the supplied floor plan image as the immutable background layer.
2. Add a separate semantic SVG overlay that traces rooms, support spaces, and open-floor zones.
3. Animate patients, beds, and wheelchairs on the overlay, not in the source image.

That avoids re-drawing the architectural linework from scratch and makes the model editable.

## What Was Identified

The overlay currently separates the plan into three categories:

- `room`: enclosed clinical spaces such as `Room 1` through `Room 22`, `Trauma 1`, `Trauma 2`, and behavioral rooms
- `support`: non-clinical or operational spaces such as `Peds Room`, `Family Room`, `Break Room`, `Dispatch`, `Viewing Room`, elevators, stairwell, nurses station, and rest rooms
- `open`: empty floor and circulation areas where a patient, bed, or wheelchair can wait or move

The blue bed rectangles shown in the image were intentionally ignored and are not represented as fixed objects.

## Current Empty-Floor Zones

The empty-floor layer is currently split into these major areas:

- `North Open Core`
- `West / South Open Floor`
- `Central Open Floor`
- `Hub East Open Floor`

These are the zones I would use first for:

- temporary bed parking
- wheelchair staging
- stretcher movement
- queue visualization
- congestion heatmaps

## Manual Boundary Fixing

The viewer now includes a manual boundary editor so you can correct wall geometry without editing code first.

Use it like this:

1. Turn on `Enable manual boundary editing`.
2. Choose a space from the dropdown or click one on the plan.
3. Drag the vertex handles to match the wall line.
4. Click `Insert Vertex`, then click a polygon edge to add another corner.
5. Click `Draw New Polygon` if the current shape is too wrong and you want to trace it again.
6. Use `Copy Selected Space` or `Copy All Spaces` to export the corrected coordinates.

This is the right workflow for refining walls before you build collision-aware patient movement.

## Pathfinding Model

Patient movement now follows a computed navigation path instead of a fixed demo line.

The logic is:

1. `open` spaces plus selected operational zones such as the ambulance entrance and hub are treated as walkable floor.
2. Rooms are treated as blocked polygons.
3. Each room is connected to the walkable floor by a door pair:
   one point just inside the room and one point just outside it.
4. The route finder runs A* over a floor grid and can only cross from corridor to room through those door connectors.

That means when you correct a room boundary, the pathfinder will route around the new wall geometry on the next path computation.

## Accuracy Note

The current polygons are manually traced from the image and aligned to a normalized `1000 x 1000` SVG viewbox.

That is good enough for a working front-end prototype, but if you need near-exact geometry for collision detection or occupancy analytics, I recommend one of these next steps:

1. Trace the floor plan once in Figma, Illustrator, or CAD and export SVG polygons.
2. Replace the current hand-written polygon coordinates with those traced polygons.
3. Keep the same data model and interaction code.

## Files

- [index.html](/Users/echohuang/Documents/the pitts replication/frontend/index.html): viewer shell
- [app.js](/Users/echohuang/Documents/the pitts replication/frontend/app.js): overlay rendering and route animation
- [floor-data.js](/Users/echohuang/Documents/the pitts replication/frontend/floor-data.js): semantic floor model
- [styles.css](/Users/echohuang/Documents/the pitts replication/frontend/styles.css): layout and overlay styling
