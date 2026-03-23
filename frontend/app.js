const { anchors, doors, routes, spaces, summary } = window.FLOOR_DATA;

const svgNs = "http://www.w3.org/2000/svg";
const gridStep = 8;
const displayHeightScale = 5530 / 6300;
const storageKey = "pitt-floor-boundaries-v1";
const walkableSpaceIds = new Set([
  "ambulance-entrance",
  "north-nurses-station",
  "the-hub"
]);

const spaceState = spaces.map((space) => ({
  ...space,
  pointsArray: parsePointsString(space.points)
}));

const state = {
  showSpaces: true,
  showLabels: true,
  showOpen: true,
  selectedSpaceId: spaceState[0]?.id ?? null,
  activeRouteId: routes[0]?.id ?? null,
  activeEntity: "patient",
  animationFrame: null,
  editMode: false,
  insertVertexMode: false,
  drawingMode: false,
  selectedVertexIndex: null,
  draggingVertex: null,
  dragStartClient: null,
  dragStartPoint: null,
  dragHandleElement: null,
  didDrag: false,
  drawingPoints: [],
  lastSavedAt: null,
  pathStatus: "Ready to compute a route through walkable floor and door gaps.",
  activeComputedPath: []
};

const elements = {
  overlay: document.querySelector("#overlay"),
  spacesLayer: document.querySelector("#spaces-layer"),
  pathsLayer: document.querySelector("#paths-layer"),
  entitiesLayer: document.querySelector("#entities-layer"),
  editorLayer: document.querySelector("#editor-layer"),
  labelsLayer: document.querySelector("#labels-layer"),
  routeSelect: document.querySelector("#route-select"),
  entitySelect: document.querySelector("#entity-select"),
  playRouteButton: document.querySelector("#play-route"),
  spaceDetails: document.querySelector("#space-details"),
  toggleSpaces: document.querySelector("#toggle-spaces"),
  toggleLabels: document.querySelector("#toggle-labels"),
  toggleOpen: document.querySelector("#toggle-open"),
  toggleEditMode: document.querySelector("#toggle-edit-mode"),
  spaceSelect: document.querySelector("#space-select"),
  insertVertexButton: document.querySelector("#insert-vertex"),
  removeVertexButton: document.querySelector("#remove-vertex"),
  startDrawSpaceButton: document.querySelector("#start-draw-space"),
  finishDrawSpaceButton: document.querySelector("#finish-draw-space"),
  copySelectedSpaceButton: document.querySelector("#copy-selected-space"),
  copyAllSpacesButton: document.querySelector("#copy-all-spaces"),
  saveBoundariesButton: document.querySelector("#save-boundaries"),
  exportOutput: document.querySelector("#export-output")
};

function parsePointsString(pointsString) {
  return pointsString
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((pair) => pair.split(",").map(Number));
}

function stringifyPoints(pointsArray) {
  return pointsArray.map(([x, y]) => `${roundPoint(x)},${roundPoint(y)}`).join(" ");
}

function stringifyDisplayPoints(pointsArray) {
  return pointsArray
    .map((point) => {
      const [x, y] = toDisplayPoint(point);
      return `${roundPoint(x)},${roundPoint(y)}`;
    })
    .join(" ");
}

function roundPoint(value) {
  return Math.round(value * 10) / 10;
}

function toDisplayPoint([x, y]) {
  return [x, y * displayHeightScale];
}

function toLogicalPoint([x, y]) {
  return [x, y / displayHeightScale];
}

function createSvgElement(name, attrs = {}) {
  const node = document.createElementNS(svgNs, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function getSpaceById(spaceId) {
  return spaceState.find((space) => space.id === spaceId) ?? null;
}

function getSelectedSpace() {
  return getSpaceById(state.selectedSpaceId);
}

function getAnchorById(anchorId) {
  return anchors.find((anchor) => anchor.id === anchorId) ?? null;
}

function getDoorsForSpace(spaceId) {
  return doors.filter((door) => door.spaceId === spaceId);
}

function isWalkableSpace(space) {
  return Boolean(space) && (space.kind === "open" || walkableSpaceIds.has(space.id));
}

function updateSpaceSelect() {
  elements.spaceSelect.replaceChildren();

  spaceState.forEach((space) => {
    const option = document.createElement("option");
    option.value = space.id;
    option.textContent = `${space.label} (${space.kind})`;
    elements.spaceSelect.appendChild(option);
  });

  if (state.selectedSpaceId) {
    elements.spaceSelect.value = state.selectedSpaceId;
  }
}

function centroidFromPoints(pointsArray) {
  const sum = pointsArray.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / pointsArray.length, y: sum.y / pointsArray.length };
}

function renderSpaceDetails(space) {
  if (!space) {
    elements.spaceDetails.innerHTML = `<p>${state.pathStatus}</p>`;
    return;
  }

  const pointText = space.pointsArray.map(([x, y], index) => `#${index + 1} (${roundPoint(x)}, ${roundPoint(y)})`).join(", ");
  elements.spaceDetails.innerHTML = `
    <strong>${space.label}</strong>
    <div>Type: ${space.kind}</div>
    <div>Role: ${space.occupancy}</div>
    <p>${space.description}</p>
    <div>Walkable: ${isWalkableSpace(space) ? "yes" : "blocked except doors"}</div>
    <div>Vertices: ${space.pointsArray.length}</div>
    <div>Saved: ${state.lastSavedAt ?? "Not saved in this session"}</div>
    <div class="point-list">${pointText}</div>
    <p>${state.pathStatus}</p>
  `;
}

function getSpaceClass(space) {
  const classes = ["space", space.kind];
  if (space.id === state.selectedSpaceId) {
    classes.push("selected");
  }
  if (state.editMode) {
    classes.push("editable");
  }
  if (isWalkableSpace(space)) {
    classes.push("walkable");
  }
  return classes.join(" ");
}

function renderSpaces() {
  elements.spacesLayer.replaceChildren();
  elements.labelsLayer.replaceChildren();

  spaceState.forEach((space) => {
    if (!state.showSpaces) {
      return;
    }

    if (!state.showOpen && space.kind === "open") {
      return;
    }

    const polygon = createSvgElement("polygon", {
      points: stringifyDisplayPoints(space.pointsArray),
      class: getSpaceClass(space),
      "data-space-id": space.id
    });

    polygon.addEventListener("click", (event) => {
      if (state.editMode && state.drawingMode) {
        event.stopPropagation();
        const viewPoint = clientToViewBox(event);
        state.drawingPoints.push([roundPoint(viewPoint.x), roundPoint(viewPoint.y)]);
        state.pathStatus = `Added point ${state.drawingPoints.length} to the new shape.`;
        renderAll();
        return;
      }

      state.selectedSpaceId = space.id;
      updateSpaceSelect();
      if (state.editMode) {
        event.stopPropagation();
        state.selectedVertexIndex = null;
        if (state.insertVertexMode) {
          const viewPoint = clientToViewBox(event);
          insertVertexAtNearestEdge(space, viewPoint);
          state.insertVertexMode = false;
          state.pathStatus = `Added a corner to ${space.label}.`;
        }
      }
      renderAll();
    });

    elements.spacesLayer.appendChild(polygon);

    if (state.showLabels) {
      const { x, y } = centroidFromPoints(space.pointsArray);
      const [displayX, displayY] = toDisplayPoint([x, y]);
      const label = createSvgElement("text", { x: displayX, y: displayY, class: `space-label ${space.kind}` });
      label.textContent = space.label;
      elements.labelsLayer.appendChild(label);
    }
  });
}

function populateRoutes() {
  routes.forEach((route) => {
    const option = document.createElement("option");
    option.value = route.id;
    option.textContent = route.label;
    elements.routeSelect.appendChild(option);
  });

  elements.routeSelect.value = state.activeRouteId;
}

function renderRoutePath() {
  elements.pathsLayer.replaceChildren();

  if (state.activeComputedPath.length < 2) {
    return;
  }

  const polyline = createSvgElement("polyline", {
    points: stringifyDisplayPoints(state.activeComputedPath),
    class: "route-line"
  });
  elements.pathsLayer.appendChild(polyline);

  doors.forEach((door) => {
    const [interiorX, interiorY] = toDisplayPoint(door.interior);
    const [exteriorX, exteriorY] = toDisplayPoint(door.exterior);
    const line = createSvgElement("line", {
      x1: interiorX,
      y1: interiorY,
      x2: exteriorX,
      y2: exteriorY,
      class: "door-link"
    });
    const doorMarker = createSvgElement("circle", {
      cx: exteriorX,
      cy: exteriorY,
      r: 4,
      class: "door-node"
    });
    elements.pathsLayer.append(line, doorMarker);
  });
}

function getEntityGlyph(kind) {
  if (kind === "bed") {
    return { radius: 14, className: "entity entity-bed", label: "B" };
  }
  if (kind === "wheelchair") {
    return { radius: 12, className: "entity entity-wheelchair", label: "W" };
  }
  return { radius: 10, className: "entity entity-patient", label: "P" };
}

function clearAnimation() {
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
  elements.entitiesLayer.replaceChildren();
}

function pathLength(points) {
  let length = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    length += Math.hypot(x2 - x1, y2 - y1);
  }
  return length;
}

function playRoute() {
  clearAnimation();

  const route = routes.find((entry) => entry.id === state.activeRouteId);
  if (!route) {
    return;
  }

  const computedPath = computeRoutePoints(route);
  if (!computedPath || computedPath.length < 2) {
    state.activeComputedPath = [];
    state.pathStatus = `No valid path found for ${route.label}. Check the corrected walls or door coordinates.`;
    renderAll();
    return;
  }

  state.activeComputedPath = computedPath;
  state.pathStatus = `Computed ${route.label} across walkable floor with door-restricted room access.`;
  renderAll();

  const glyph = getEntityGlyph(state.activeEntity);
  const group = createSvgElement("g");
  const [startDisplayX, startDisplayY] = toDisplayPoint(computedPath[0]);
  const circle = createSvgElement("circle", {
    cx: startDisplayX,
    cy: startDisplayY,
    r: glyph.radius,
    class: glyph.className
  });
  const text = createSvgElement("text", {
    x: startDisplayX,
    y: startDisplayY + 1,
    class: "entity-label"
  });
  text.textContent = glyph.label;
  group.append(circle, text);
  elements.entitiesLayer.appendChild(group);

  const segments = [];
  let totalLength = 0;
  for (let index = 0; index < computedPath.length - 1; index += 1) {
    const [x1, y1] = computedPath[index];
    const [x2, y2] = computedPath[index + 1];
    const length = Math.hypot(x2 - x1, y2 - y1);
    segments.push({ x1, y1, x2, y2, length });
    totalLength += length;
  }

  const durationMs = Math.max(2500, pathLength(computedPath) * 8);
  const start = performance.now();

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const distance = totalLength * progress;

    let walked = 0;
    let position = computedPath[computedPath.length - 1];

    for (const segment of segments) {
      if (walked + segment.length >= distance) {
        const segmentProgress = (distance - walked) / segment.length;
        position = [
          segment.x1 + (segment.x2 - segment.x1) * segmentProgress,
          segment.y1 + (segment.y2 - segment.y1) * segmentProgress
        ];
        break;
      }
      walked += segment.length;
    }

    const [displayX, displayY] = toDisplayPoint(position);
    circle.setAttribute("cx", displayX);
    circle.setAttribute("cy", displayY);
    text.setAttribute("x", displayX);
    text.setAttribute("y", displayY + 1);

    if (progress < 1) {
      state.animationFrame = requestAnimationFrame(step);
    }
  };

  state.animationFrame = requestAnimationFrame(step);
}

function clientPointToViewBox(clientX, clientY) {
  const matrix = elements.overlay.getScreenCTM();
  if (!matrix) {
    return { x: 0, y: 0 };
  }

  const transformed = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  const [logicalX, logicalY] = toLogicalPoint([transformed.x, transformed.y]);
  return {
    x: Math.max(0, Math.min(1000, logicalX)),
    y: Math.max(0, Math.min(1000, logicalY))
  };
}

function clientToViewBox(event) {
  return clientPointToViewBox(event.clientX, event.clientY);
}

function distanceToSegment(point, start, end) {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - x1, point.y - y1);
  }

  const t = Math.max(0, Math.min(1, ((point.x - x1) * dx + (point.y - y1) * dy) / lengthSquared));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;
  return Math.hypot(point.x - projectionX, point.y - projectionY);
}

function insertVertexAtNearestEdge(space, point) {
  if (!space || space.pointsArray.length < 2) {
    return;
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < space.pointsArray.length; index += 1) {
    const start = space.pointsArray[index];
    const end = space.pointsArray[(index + 1) % space.pointsArray.length];
    const distance = distanceToSegment(point, start, end);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index + 1;
    }
  }

  space.pointsArray.splice(nearestIndex, 0, [roundPoint(point.x), roundPoint(point.y)]);
  state.selectedVertexIndex = nearestIndex;
}

function updateSelectedSpaceGeometryInDom() {
  const selectedSpace = getSelectedSpace();
  if (!selectedSpace) {
    return;
  }

  const points = stringifyDisplayPoints(selectedSpace.pointsArray);
  const polygon = elements.spacesLayer.querySelector(`[data-space-id="${selectedSpace.id}"]`);
  if (polygon) {
    polygon.setAttribute("points", points);
  }

  const outline = elements.editorLayer.querySelector(".editor-outline");
  if (outline) {
    outline.setAttribute("points", points);
  }

  const handle = state.dragHandleElement;
  if (handle && state.draggingVertex !== null) {
    const [x, y] = selectedSpace.pointsArray[state.draggingVertex];
    const [displayX, displayY] = toDisplayPoint([x, y]);
    handle.setAttribute("cx", displayX);
    handle.setAttribute("cy", displayY);
  }
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const [xi, yi] = polygon[index];
    const [xj, yj] = polygon[previous];
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.00001) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function createNavigationGrid() {
  const width = 1000;
  const height = 1000;
  const cols = Math.floor(width / gridStep) + 1;
  const rows = Math.floor(height / gridStep) + 1;
  const walkablePolygons = spaceState.filter(isWalkableSpace).map((space) => space.pointsArray);
  const mask = Array.from({ length: rows }, () => Array(cols).fill(false));

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const point = { x: col * gridStep, y: row * gridStep };
      mask[row][col] = walkablePolygons.some((polygon) => pointInPolygon(point, polygon));
    }
  }

  [...anchors.map((anchor) => anchor.point), ...doors.map((door) => door.exterior)].forEach(([x, y]) => {
    const cell = pointToCell([x, y], cols, rows);
    mask[cell.row][cell.col] = true;
  });

  return { cols, rows, mask };
}

function pointToCell([x, y], cols, rows) {
  return {
    col: Math.min(cols - 1, Math.max(0, Math.round(x / gridStep))),
    row: Math.min(rows - 1, Math.max(0, Math.round(y / gridStep)))
  };
}

function cellToPoint(cell) {
  return [cell.col * gridStep, cell.row * gridStep];
}

function heuristic(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function serializeCell(cell) {
  return `${cell.col},${cell.row}`;
}

function findGridPath(grid, startPoint, endPoint) {
  const start = pointToCell(startPoint, grid.cols, grid.rows);
  const goal = pointToCell(endPoint, grid.cols, grid.rows);
  const startKey = serializeCell(start);
  const goalKey = serializeCell(goal);

  if (!grid.mask[start.row]?.[start.col] || !grid.mask[goal.row]?.[goal.col]) {
    return null;
  }

  const openList = [start];
  const cameFrom = new Map();
  const gScore = new Map([[startKey, 0]]);
  const fScore = new Map([[startKey, heuristic(start, goal)]]);

  while (openList.length > 0) {
    openList.sort((left, right) => (fScore.get(serializeCell(left)) ?? Infinity) - (fScore.get(serializeCell(right)) ?? Infinity));
    const current = openList.shift();
    const currentKey = serializeCell(current);

    if (currentKey === goalKey) {
      return reconstructPath(cameFrom, current).map(cellToPoint);
    }

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        const neighbor = { col: current.col + colOffset, row: current.row + rowOffset };
        if (neighbor.col < 0 || neighbor.row < 0 || neighbor.col >= grid.cols || neighbor.row >= grid.rows) {
          continue;
        }
        if (!grid.mask[neighbor.row][neighbor.col]) {
          continue;
        }
        if (rowOffset !== 0 && colOffset !== 0) {
          if (!grid.mask[current.row][neighbor.col] || !grid.mask[neighbor.row][current.col]) {
            continue;
          }
        }

        const neighborKey = serializeCell(neighbor);
        const tentative = (gScore.get(currentKey) ?? Infinity) + Math.hypot(rowOffset, colOffset);
        if (tentative >= (gScore.get(neighborKey) ?? Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentative);
        fScore.set(neighborKey, tentative + heuristic(neighbor, goal));

        if (!openList.some((cell) => cell.col === neighbor.col && cell.row === neighbor.row)) {
          openList.push(neighbor);
        }
      }
    }
  }

  return null;
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  let cursor = current;
  while (cameFrom.has(serializeCell(cursor))) {
    cursor = cameFrom.get(serializeCell(cursor));
    path.unshift(cursor);
  }
  return path;
}

function straightLineWalkable(grid, startPoint, endPoint) {
  const distance = Math.hypot(endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]);
  const steps = Math.max(2, Math.ceil(distance / (gridStep / 2)));

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const point = [
      startPoint[0] + (endPoint[0] - startPoint[0]) * t,
      startPoint[1] + (endPoint[1] - startPoint[1]) * t
    ];
    const cell = pointToCell(point, grid.cols, grid.rows);
    if (!grid.mask[cell.row]?.[cell.col]) {
      return false;
    }
  }
  return true;
}

function simplifyPath(grid, points) {
  if (!points || points.length < 3) {
    return points ?? [];
  }

  const collapsed = [points[0]];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = collapsed[collapsed.length - 1];
    const current = points[index];
    const next = points[index + 1];
    const dx1 = Math.sign(current[0] - previous[0]);
    const dy1 = Math.sign(current[1] - previous[1]);
    const dx2 = Math.sign(next[0] - current[0]);
    const dy2 = Math.sign(next[1] - current[1]);
    if (dx1 !== dx2 || dy1 !== dy2) {
      collapsed.push(current);
    }
  }
  collapsed.push(points[points.length - 1]);

  const smoothed = [collapsed[0]];
  let index = 0;
  while (index < collapsed.length - 1) {
    let furthest = index + 1;
    for (let probe = collapsed.length - 1; probe > index + 1; probe -= 1) {
      if (straightLineWalkable(grid, collapsed[index], collapsed[probe])) {
        furthest = probe;
        break;
      }
    }
    smoothed.push(collapsed[furthest]);
    index = furthest;
  }

  return dedupePoints(smoothed);
}

function dedupePoints(points) {
  const unique = [];
  points.forEach((point) => {
    const previous = unique[unique.length - 1];
    if (!previous || previous[0] !== point[0] || previous[1] !== point[1]) {
      unique.push(point);
    }
  });
  return unique;
}

function resolveEndpoint(anchorId, role) {
  const anchor = getAnchorById(anchorId);
  if (!anchor) {
    return null;
  }

  const space = getSpaceById(anchor.spaceId);
  if (!space) {
    return null;
  }

  if (isWalkableSpace(space)) {
    return {
      anchorPoint: anchor.point,
      navPoint: anchor.point,
      prefix: role === "start" ? [anchor.point] : [],
      suffix: role === "end" ? [anchor.point] : []
    };
  }

  const spaceDoors = getDoorsForSpace(space.id);
  if (spaceDoors.length === 0) {
    return null;
  }

  const nearestDoor = spaceDoors.reduce((best, door) => {
    const bestDistance = best ? Math.hypot(best.interior[0] - anchor.point[0], best.interior[1] - anchor.point[1]) : Infinity;
    const currentDistance = Math.hypot(door.interior[0] - anchor.point[0], door.interior[1] - anchor.point[1]);
    return currentDistance < bestDistance ? door : best;
  }, null);

  return {
    anchorPoint: anchor.point,
    navPoint: nearestDoor.exterior,
    prefix: role === "start" ? [anchor.point, nearestDoor.interior, nearestDoor.exterior] : [],
    suffix: role === "end" ? [nearestDoor.exterior, nearestDoor.interior, anchor.point] : []
  };
}

function computeRoutePoints(route) {
  const start = resolveEndpoint(route.from, "start");
  const end = resolveEndpoint(route.to, "end");
  if (!start || !end) {
    return null;
  }

  const grid = createNavigationGrid();
  const gridPath = findGridPath(grid, start.navPoint, end.navPoint);
  if (!gridPath) {
    return null;
  }

  const path = [
    ...start.prefix,
    ...simplifyPath(grid, gridPath),
    ...end.suffix
  ];

  return dedupePoints(path);
}

function renderEditor() {
  elements.editorLayer.replaceChildren();

  const selectedSpace = getSelectedSpace();
  if (!state.editMode || !selectedSpace) {
    updateExportOutput();
    return;
  }

  const outline = createSvgElement("polygon", {
    points: stringifyDisplayPoints(selectedSpace.pointsArray),
    class: "editor-outline"
  });
  elements.editorLayer.appendChild(outline);

  selectedSpace.pointsArray.forEach(([x, y], index) => {
    const [displayX, displayY] = toDisplayPoint([x, y]);
    const handle = createSvgElement("circle", {
      cx: displayX,
      cy: displayY,
      r: 8,
      class: index === state.selectedVertexIndex ? "editor-handle selected" : "editor-handle"
    });
    handle.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      event.preventDefault();
      state.draggingVertex = index;
      state.dragStartClient = { x: event.clientX, y: event.clientY };
      state.dragStartPoint = { x, y };
      state.dragHandleElement = handle;
      state.didDrag = false;
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
    elements.editorLayer.appendChild(handle);
  });

  getDoorsForSpace(selectedSpace.id).forEach((door) => {
    const [interiorX, interiorY] = toDisplayPoint(door.interior);
    const [exteriorX, exteriorY] = toDisplayPoint(door.exterior);
    const line = createSvgElement("line", {
      x1: interiorX,
      y1: interiorY,
      x2: exteriorX,
      y2: exteriorY,
      class: "editor-door-link"
    });
    const inner = createSvgElement("circle", {
      cx: interiorX,
      cy: interiorY,
      r: 5,
      class: "editor-door interior"
    });
    const outer = createSvgElement("circle", {
      cx: exteriorX,
      cy: exteriorY,
      r: 5,
      class: "editor-door exterior"
    });
    elements.editorLayer.append(line, inner, outer);
  });

  if (state.drawingMode && state.drawingPoints.length > 0) {
    const draftPolyline = createSvgElement("polyline", {
      points: stringifyDisplayPoints(state.drawingPoints),
      class: "draft-line"
    });
    elements.editorLayer.appendChild(draftPolyline);
  }

  updateExportOutput();
}

function updateExportOutput() {
  if (state.drawingMode && state.drawingPoints.length > 0) {
    elements.exportOutput.value = JSON.stringify(state.drawingPoints, null, 2);
    return;
  }

  const selectedSpace = getSelectedSpace();
  if (!selectedSpace) {
    elements.exportOutput.value = exportAllSpaces();
    return;
  }

  const selectedDoors = getDoorsForSpace(selectedSpace.id);
  elements.exportOutput.value = JSON.stringify(
    {
      id: selectedSpace.id,
      label: selectedSpace.label,
      kind: selectedSpace.kind,
      occupancy: selectedSpace.occupancy,
      points: selectedSpace.pointsArray,
      pointsString: stringifyPoints(selectedSpace.pointsArray),
      doors: selectedDoors
    },
    null,
    2
  );
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    state.pathStatus = "Copied data to the clipboard.";
    renderSpaceDetails(getSelectedSpace());
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    document.body.removeChild(textArea);

    if (copied) {
      state.pathStatus = "Copied data to the clipboard.";
    } else {
      elements.exportOutput.focus();
      elements.exportOutput.select();
      state.pathStatus = "Clipboard copy was blocked. The export box is selected so you can copy manually.";
    }

    renderSpaceDetails(getSelectedSpace());
  }
}

function exportAllSpaces() {
  return JSON.stringify(
    {
      spaces: spaceState.map(({ pointsArray, ...rest }) => ({ ...rest, points: stringifyPoints(pointsArray) })),
      doors,
      anchors
    },
    null,
    2
  );
}

function saveBoundaries() {
  const payload = exportAllSpaces();

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith("pitt-floor-boundaries") && key !== storageKey) {
        window.localStorage.removeItem(key);
      }
    }

    window.localStorage.setItem(storageKey, payload);
    state.lastSavedAt = new Date().toLocaleString();
    state.pathStatus = "Saved the newest boundary data to browser storage. Older saved versions were cleared.";
  } catch {
    state.pathStatus = "Could not save to browser storage.";
  }
  renderSpaceDetails(getSelectedSpace());
}

function loadSavedBoundaries() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed.spaces)) {
      parsed.spaces.forEach((savedSpace) => {
        const target = getSpaceById(savedSpace.id);
        if (target && typeof savedSpace.points === "string") {
          target.pointsArray = parsePointsString(savedSpace.points);
        }
      });
    }

    if (Array.isArray(parsed.doors)) {
      parsed.doors.forEach((savedDoor) => {
        const target = doors.find((door) => door.id === savedDoor.id);
        if (target && Array.isArray(savedDoor.interior) && Array.isArray(savedDoor.exterior)) {
          target.interior = savedDoor.interior;
          target.exterior = savedDoor.exterior;
        }
      });
    }

    if (Array.isArray(parsed.anchors)) {
      parsed.anchors.forEach((savedAnchor) => {
        const target = anchors.find((anchor) => anchor.id === savedAnchor.id);
        if (target && Array.isArray(savedAnchor.point)) {
          target.point = savedAnchor.point;
        }
      });
    }

    state.lastSavedAt = new Date().toLocaleString();
    state.pathStatus = "Loaded saved boundary data from browser storage.";
  } catch {
    state.pathStatus = "Saved boundary data was found but could not be loaded.";
  }
}

function bindControls() {
  elements.toggleSpaces.addEventListener("change", (event) => {
    state.showSpaces = event.target.checked;
    renderAll();
  });
  elements.toggleLabels.addEventListener("change", (event) => {
    state.showLabels = event.target.checked;
    renderAll();
  });
  elements.toggleOpen.addEventListener("change", (event) => {
    state.showOpen = event.target.checked;
    renderAll();
  });
  elements.routeSelect.addEventListener("change", (event) => {
    state.activeRouteId = event.target.value;
    state.activeComputedPath = [];
    clearAnimation();
    renderAll();
  });
  elements.entitySelect.addEventListener("change", (event) => {
    state.activeEntity = event.target.value;
    clearAnimation();
  });
  elements.playRouteButton.addEventListener("click", playRoute);
  elements.toggleEditMode.addEventListener("change", (event) => {
    state.editMode = event.target.checked;
    state.insertVertexMode = false;
    state.drawingMode = false;
    state.drawingPoints = [];
    state.selectedVertexIndex = null;
    renderAll();
  });
  elements.spaceSelect.addEventListener("change", (event) => {
    state.selectedSpaceId = event.target.value;
    state.selectedVertexIndex = null;
    renderAll();
  });
  elements.insertVertexButton.addEventListener("click", () => {
    state.insertVertexMode = !state.insertVertexMode;
    state.drawingMode = false;
    state.drawingPoints = [];
    state.selectedVertexIndex = null;
    state.pathStatus = state.insertVertexMode
      ? "Add Corner is active. Click an edge on the selected space."
      : "Add Corner is off.";
    renderAll();
  });
  elements.removeVertexButton.addEventListener("click", () => {
    const selectedSpace = getSelectedSpace();
    if (!selectedSpace || state.selectedVertexIndex === null || selectedSpace.pointsArray.length <= 3) {
      return;
    }
    selectedSpace.pointsArray.splice(state.selectedVertexIndex, 1);
    state.selectedVertexIndex = null;
    renderAll();
  });
  elements.startDrawSpaceButton.addEventListener("click", () => {
    state.drawingMode = true;
    state.insertVertexMode = false;
    state.drawingPoints = [];
    state.selectedVertexIndex = null;
    state.pathStatus = "Draw New Shape is active. Click around the boundary to place points, then click Finish Shape.";
    renderAll();
  });
  elements.finishDrawSpaceButton.addEventListener("click", () => {
    const selectedSpace = getSelectedSpace();
    if (!selectedSpace || state.drawingPoints.length < 3) {
      state.pathStatus = "Finish Shape needs at least 3 points.";
      renderSpaceDetails(getSelectedSpace());
      return;
    }
    selectedSpace.pointsArray = state.drawingPoints.map(([x, y]) => [roundPoint(x), roundPoint(y)]);
    state.drawingMode = false;
    state.drawingPoints = [];
    state.pathStatus = `Replaced ${selectedSpace.label} with the newly drawn shape.`;
    renderAll();
  });
  elements.copySelectedSpaceButton.addEventListener("click", () => copyText(elements.exportOutput.value));
  elements.copyAllSpacesButton.addEventListener("click", () => {
    const payload = exportAllSpaces();
    elements.exportOutput.value = payload;
    copyText(payload);
  });
  elements.saveBoundariesButton.addEventListener("click", saveBoundaries);

  window.addEventListener("pointermove", (event) => {
    if (!state.editMode || state.draggingVertex === null) {
      return;
    }
    const selectedSpace = getSelectedSpace();
    if (!selectedSpace) {
      return;
    }

    const dragDistance = Math.hypot(
      event.clientX - state.dragStartClient.x,
      event.clientY - state.dragStartClient.y
    );
    if (dragDistance < 2) {
      return;
    }

    state.didDrag = true;
    const startViewPoint = clientPointToViewBox(state.dragStartClient.x, state.dragStartClient.y);
    const currentViewPoint = clientToViewBox(event);
    const deltaX = currentViewPoint.x - startViewPoint.x;
    const deltaY = currentViewPoint.y - startViewPoint.y;
    selectedSpace.pointsArray[state.draggingVertex] = [
      roundPoint(state.dragStartPoint.x + deltaX),
      roundPoint(state.dragStartPoint.y + deltaY)
    ];
    updateSelectedSpaceGeometryInDom();
  });

  window.addEventListener("pointerup", () => {
    if (state.draggingVertex !== null && !state.didDrag) {
      state.selectedVertexIndex = state.draggingVertex;
    }
    if (state.draggingVertex !== null) {
      renderAll();
    }
    state.draggingVertex = null;
    state.dragStartClient = null;
    state.dragStartPoint = null;
    state.dragHandleElement = null;
    state.didDrag = false;
  });
  window.addEventListener("blur", () => {
    state.draggingVertex = null;
    state.dragStartClient = null;
    state.dragStartPoint = null;
    state.dragHandleElement = null;
    state.didDrag = false;
  });

  elements.overlay.addEventListener("click", (event) => {
    if (!state.editMode) {
      return;
    }
    if (state.drawingMode) {
      const viewPoint = clientToViewBox(event);
      state.drawingPoints.push([roundPoint(viewPoint.x), roundPoint(viewPoint.y)]);
      state.pathStatus = `Added point ${state.drawingPoints.length} to the new shape.`;
      renderAll();
    }
  });
}

function renderSummary() {
  const noteBlock = document.createElement("div");
  noteBlock.className = "summary-notes";
  noteBlock.innerHTML = summary.notes.map((note) => `<p>${note}</p>`).join("");
  elements.spaceDetails.after(noteBlock);
}

function renderAll() {
  renderSpaces();
  renderRoutePath();
  renderEditor();
  renderSpaceDetails(getSelectedSpace());
  elements.insertVertexButton.classList.toggle("is-active", state.insertVertexMode);
  elements.startDrawSpaceButton.classList.toggle("is-active", state.drawingMode);
}

function init() {
  loadSavedBoundaries();
  populateRoutes();
  updateSpaceSelect();
  bindControls();
  renderAll();
  renderSummary();
}

if (window.FLOOR_DATA) {
  init();
}
