(() => {
const toPoints = (pairs) => pairs.map(([x, y]) => `${x},${y}`).join(" ");

const spaces = [
  {
    id: "peds-room",
    label: "Peds Room",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[60, 150], [160, 150], [160, 275], [60, 275]]),
    description: "Enclosed pediatric exam room in the northwest corner."
  },
  {
    id: "family-room",
    label: "Family Room",
    kind: "support",
    occupancy: "support",
    points: toPoints([[170, 90], [250, 90], [250, 210], [170, 210]]),
    description: "Family consult / waiting room beside the peds room."
  },
  {
    id: "rest-room-north",
    label: "Rest Room",
    kind: "support",
    occupancy: "support",
    points: toPoints([[255, 135], [330, 135], [330, 215], [255, 215]]),
    description: "North-side restroom block next to the family room."
  },
  {
    id: "break-room",
    label: "Break Room",
    kind: "support",
    occupancy: "support",
    points: toPoints([[330, 100], [430, 100], [430, 205], [330, 205]]),
    description: "Staff break room opening into the north circulation zone."
  },
  {
    id: "room-1",
    label: "Room 1",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[445, 95], [490, 95], [490, 175], [445, 175]]),
    description: "North pod treatment room."
  },
  {
    id: "room-2",
    label: "Room 2",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[505, 95], [560, 110], [540, 190], [485, 180]]),
    description: "Angled treatment room in the northeast arc."
  },
  {
    id: "room-3",
    label: "Room 3",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[580, 125], [630, 165], [595, 235], [545, 195]]),
    description: "Angled treatment room in the northeast arc."
  },
  {
    id: "room-4",
    label: "Room 4",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[615, 220], [680, 255], [655, 345], [595, 300]]),
    description: "Angled treatment room closest to the northeast node."
  },
  {
    id: "viewing-room",
    label: "Viewing Room",
    kind: "support",
    occupancy: "support",
    points: toPoints([[645, 95], [735, 95], [735, 175], [645, 175]]),
    description: "North-east support room labeled as viewing room."
  },
  {
    id: "stairwell",
    label: "Stairwell",
    kind: "support",
    occupancy: "vertical",
    points: toPoints([[740, 165], [815, 165], [815, 295], [740, 295]]),
    description: "Stair access core between north rooms and ambulance side."
  },
  {
    id: "ambulance-entrance",
    label: "Ambulance Entrance",
    kind: "support",
    occupancy: "entry",
    points: toPoints([[815, 100], [940, 100], [940, 320], [815, 320]]),
    description: "Large northeast receiving zone marked as ambulance entrance."
  },
  {
    id: "room-5",
    label: "Room 5",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[620, 345], [705, 345], [705, 415], [620, 415]]),
    description: "East-side treatment room above room 6."
  },
  {
    id: "room-6",
    label: "Room 6",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[610, 420], [725, 420], [725, 495], [610, 495]]),
    description: "East-side treatment room below room 5."
  },
  {
    id: "dispatch",
    label: "Dispatch",
    kind: "support",
    occupancy: "admin",
    points: toPoints([[860, 365], [910, 365], [910, 475], [860, 475]]),
    description: "Small dispatch room on the east side corridor."
  },
  {
    id: "behavioral-1",
    label: "Behavioral Room 1",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[830, 470], [945, 470], [945, 570], [830, 570]]),
    description: "Upper behavioral health room on the east side."
  },
  {
    id: "behavioral-2",
    label: "Behavioral Room 2",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[840, 585], [945, 585], [945, 675], [840, 675]]),
    description: "Lower behavioral health room on the east side."
  },
  {
    id: "room-7",
    label: "Room 7",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[495, 355], [575, 355], [575, 440], [495, 440]]),
    description: "Center-north treatment room."
  },
  {
    id: "room-8",
    label: "Room 8",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[405, 355], [490, 355], [490, 440], [405, 440]]),
    description: "Center-north treatment room."
  },
  {
    id: "room-9",
    label: "Room 9",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[325, 355], [400, 355], [400, 440], [325, 440]]),
    description: "Center-north treatment room."
  },
  {
    id: "room-10",
    label: "Room 10",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[245, 355], [320, 355], [320, 445], [245, 445]]),
    description: "Center-north treatment room."
  },
  {
    id: "room-11",
    label: "Room 11",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[170, 405], [245, 360], [235, 475], [145, 475]]),
    description: "Angled treatment room on the west interior edge."
  },
  {
    id: "room-12",
    label: "Room 12",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[90, 525], [180, 470], [210, 590], [115, 615]]),
    description: "Southwest treatment room at the upper bend."
  },
  {
    id: "room-13",
    label: "Room 13",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[100, 610], [190, 610], [190, 700], [100, 700]]),
    description: "Southwest treatment room."
  },
  {
    id: "room-14",
    label: "Room 14",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[95, 700], [190, 700], [190, 805], [95, 805]]),
    description: "Southwest treatment room at the lower west edge."
  },
  {
    id: "room-15",
    label: "Room 15",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[300, 620], [390, 620], [390, 730], [300, 730]]),
    description: "South-central treatment room."
  },
  {
    id: "room-16",
    label: "Room 16",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[315, 735], [405, 735], [405, 835], [315, 835]]),
    description: "South-central treatment room below room 15."
  },
  {
    id: "room-17",
    label: "Room 17",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[395, 790], [475, 745], [515, 820], [445, 885]]),
    description: "Angled treatment room on the south-western arc."
  },
  {
    id: "room-18",
    label: "Room 18",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[505, 815], [585, 825], [545, 905], [475, 885]]),
    description: "Treatment room along the south arc."
  },
  {
    id: "room-19",
    label: "Room 19",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[590, 840], [670, 845], [645, 930], [560, 925]]),
    description: "Treatment room along the south arc."
  },
  {
    id: "room-20",
    label: "Room 20",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[675, 845], [760, 845], [760, 935], [680, 940]]),
    description: "Treatment room near the south-east rest room corridor."
  },
  {
    id: "room-21",
    label: "Room 21",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[505, 735], [590, 735], [590, 805], [505, 805]]),
    description: "Vertical treatment room in the central south island."
  },
  {
    id: "room-22",
    label: "Room 22",
    kind: "room",
    occupancy: "clinical",
    points: toPoints([[505, 655], [590, 655], [590, 725], [505, 725]]),
    description: "Vertical treatment room in the central south island."
  },
  {
    id: "trauma-1",
    label: "Trauma 1",
    kind: "room",
    occupancy: "critical",
    points: toPoints([[660, 700], [790, 700], [790, 875], [660, 875]]),
    description: "Large trauma bay in the south-east cluster."
  },
  {
    id: "trauma-2",
    label: "Trauma 2",
    kind: "room",
    occupancy: "critical",
    points: toPoints([[805, 700], [935, 700], [935, 875], [805, 875]]),
    description: "Large trauma bay in the south-east cluster."
  },
  {
    id: "elevator-1",
    label: "Elevator 1",
    kind: "support",
    occupancy: "vertical",
    points: toPoints([[840, 875], [910, 875], [910, 965], [840, 965]]),
    description: "South-east elevator core."
  },
  {
    id: "elevator-2",
    label: "Elevator 2",
    kind: "support",
    occupancy: "vertical",
    points: toPoints([[180, 835], [250, 835], [250, 930], [180, 930]]),
    description: "South-west elevator core."
  },
  {
    id: "north-nurses-station",
    label: "North Nurses Station",
    kind: "support",
    occupancy: "station",
    points: toPoints([[365, 205], [620, 205], [680, 330], [360, 330]]),
    description: "Curved north nurses station and its immediate work area."
  },
  {
    id: "the-hub",
    label: "The Hub",
    kind: "support",
    occupancy: "station",
    points: toPoints([[560, 560], [735, 560], [735, 690], [560, 690]]),
    description: "Central operations hub with workstation cluster."
  },
  {
    id: "open-north-core",
    label: "North Open Core",
    kind: "open",
    occupancy: "circulation",
    points: toPoints([[170, 220], [350, 220], [350, 320], [620, 340], [595, 470], [210, 470], [170, 360]]),
    description: "Large open treatment and circulation floor around the north nurses station."
  },
  {
    id: "open-west-south",
    label: "West / South Open Floor",
    kind: "open",
    occupancy: "circulation",
    points: toPoints([[40, 430], [300, 460], [330, 560], [300, 820], [170, 930], [40, 930]]),
    description: "Large empty floor area on the west and south-west side for movement and temporary placement."
  },
  {
    id: "open-central-south",
    label: "Central Open Floor",
    kind: "open",
    occupancy: "circulation",
    points: toPoints([[250, 470], [560, 470], [560, 640], [500, 850], [350, 845], [320, 740], [260, 700], [215, 590]]),
    description: "Main open floor field between the north rooms, room island, and south arc."
  },
  {
    id: "open-hub-east",
    label: "Hub East Open Floor",
    kind: "open",
    occupancy: "circulation",
    points: toPoints([[720, 430], [980, 430], [980, 690], [780, 690], [735, 640], [735, 560], [720, 520]]),
    description: "Open east-side circulation zone around the hub and behavioral rooms."
  },
  {
    id: "south-restrooms",
    label: "South Rest Rooms",
    kind: "support",
    occupancy: "support",
    points: toPoints([[735, 920], [830, 920], [830, 980], [735, 980]]),
    description: "Rest rooms at the south edge near room 20."
  }
];

const doors = [
  { id: "door-room-1", spaceId: "room-1", interior: [468, 174], exterior: [468, 192] },
  { id: "door-room-2", spaceId: "room-2", interior: [505, 185], exterior: [494, 202] },
  { id: "door-room-3", spaceId: "room-3", interior: [562, 218], exterior: [544, 238] },
  { id: "door-room-4", spaceId: "room-4", interior: [620, 312], exterior: [603, 331] },
  { id: "door-room-5", spaceId: "room-5", interior: [624, 404], exterior: [606, 404] },
  { id: "door-room-6", spaceId: "room-6", interior: [620, 438], exterior: [598, 438] },
  { id: "door-room-7", spaceId: "room-7", interior: [500, 432], exterior: [500, 452] },
  { id: "door-room-8", spaceId: "room-8", interior: [418, 432], exterior: [418, 452] },
  { id: "door-room-9", spaceId: "room-9", interior: [343, 432], exterior: [343, 452] },
  { id: "door-room-10", spaceId: "room-10", interior: [262, 438], exterior: [262, 458] },
  { id: "door-room-11", spaceId: "room-11", interior: [225, 454], exterior: [243, 471] },
  { id: "door-room-12", spaceId: "room-12", interior: [173, 552], exterior: [194, 543] },
  { id: "door-room-13", spaceId: "room-13", interior: [186, 635], exterior: [206, 635] },
  { id: "door-room-14", spaceId: "room-14", interior: [186, 736], exterior: [206, 736] },
  { id: "door-room-15", spaceId: "room-15", interior: [390, 670], exterior: [410, 670] },
  { id: "door-room-16", spaceId: "room-16", interior: [406, 787], exterior: [426, 787] },
  { id: "door-room-17", spaceId: "room-17", interior: [447, 810], exterior: [470, 794] },
  { id: "door-room-18", spaceId: "room-18", interior: [517, 841], exterior: [501, 823] },
  { id: "door-room-19", spaceId: "room-19", interior: [611, 849], exterior: [611, 830] },
  { id: "door-room-20", spaceId: "room-20", interior: [681, 849], exterior: [681, 829] },
  { id: "door-room-21", spaceId: "room-21", interior: [588, 765], exterior: [608, 765] },
  { id: "door-room-22", spaceId: "room-22", interior: [588, 687], exterior: [608, 687] },
  { id: "door-trauma-1", spaceId: "trauma-1", interior: [725, 700], exterior: [725, 678] },
  { id: "door-trauma-2", spaceId: "trauma-2", interior: [870, 700], exterior: [870, 678] },
  { id: "door-behavioral-1", spaceId: "behavioral-1", interior: [845, 520], exterior: [824, 520] },
  { id: "door-behavioral-2", spaceId: "behavioral-2", interior: [850, 619], exterior: [828, 619] },
  { id: "door-viewing-room", spaceId: "viewing-room", interior: [680, 176], exterior: [680, 196] },
  { id: "door-break-room", spaceId: "break-room", interior: [390, 204], exterior: [390, 224] },
  { id: "door-peds-room", spaceId: "peds-room", interior: [160, 240], exterior: [178, 240] }
];

const anchors = [
  { id: "ambulance-bay", label: "Ambulance Bay", spaceId: "ambulance-entrance", point: [888, 220] },
  { id: "north-core", label: "North Core", spaceId: "open-north-core", point: [545, 310] },
  { id: "hub-center", label: "The Hub", spaceId: "the-hub", point: [645, 622] },
  { id: "west-open", label: "West Open Floor", spaceId: "open-west-south", point: [182, 610] },
  { id: "room-8-bedside", label: "Room 8", spaceId: "room-8", point: [447, 394] },
  { id: "room-15-bedside", label: "Room 15", spaceId: "room-15", point: [346, 679] },
  { id: "behavioral-1-bedside", label: "Behavioral Room 1", spaceId: "behavioral-1", point: [890, 522] },
  { id: "trauma-1-center", label: "Trauma 1", spaceId: "trauma-1", point: [724, 785] },
  { id: "trauma-2-center", label: "Trauma 2", spaceId: "trauma-2", point: [872, 785] }
];

const routes = [
  {
    id: "ambulance-to-trauma-1",
    label: "Ambulance Entrance -> Trauma 1",
    from: "ambulance-bay",
    to: "trauma-1-center"
  },
  {
    id: "ambulance-to-room-8",
    label: "Ambulance Entrance -> Room 8",
    from: "ambulance-bay",
    to: "room-8-bedside"
  },
  {
    id: "hub-to-behavioral-1",
    label: "The Hub -> Behavioral Room 1",
    from: "hub-center",
    to: "behavioral-1-bedside"
  },
  {
    id: "west-open-to-room-15",
    label: "West Open Floor -> Room 15",
    from: "west-open",
    to: "room-15-bedside"
  },
  {
    id: "north-core-to-trauma-2",
    label: "North Core -> Trauma 2",
    from: "north-core",
    to: "trauma-2-center"
  }
];

const summary = {
  sourceImage: "./Set Designers Floor Plan of The Pitt.webp",
  notes: [
    "The base image remains unchanged to preserve the exact set-designer geometry.",
    "Blue bed symbols in the supplied floor plan are intentionally omitted from the semantic overlay.",
    "Space polygons are manually approximated from the image and should be treated as an editable tracing layer, not CAD-grade coordinates."
  ]
};

window.FLOOR_DATA = {
  spaces,
  doors,
  anchors,
  routes,
  summary
};
})();
