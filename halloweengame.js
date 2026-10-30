const canvas = document.querySelector("#arena");
const ctx = canvas.getContext("2d");
const characterMenu = document.querySelector("#character-menu");
const arenaScreen = document.querySelector("#arena-screen");
const gameOver = document.querySelector("#game-over");
const upgradePanel = document.querySelector("#upgrade-panel");
const statusText = document.querySelector("#status");
const weaponSelect = document.querySelector("#weapon");
const outfitSelect = document.querySelector("#outfit");
const accessorySelect = document.querySelector("#accessory");
const startingItemSelect = document.querySelector("#starting-item");
const modeSelect = document.querySelector("#mode");
const startModeSelect = document.querySelector("#start-mode");

const WORLD = { width: 6000, height: 4000 };
const MATCH_FIGHTER_LIMIT = 100;
const BOT_RETHINK_MIN = 240;
const BOT_RETHINK_VARIANCE = 160;
const STORM = { delay: 20000, duration: 150000, minimumRadius: 260, damagePerSecond: 14 };
const SCOPE_WIDE_ZOOM = 0.78;
const SCOPE_FOCUSED_ZOOM = 1.3;
const SCOPE_FOCUS_TIME = 1.1;
const ROOF_VIEW_ZOOM = 0.82;
const ROOF_EDGE_DEPTH = 42;
const ROOF_MOVE_MULTIPLIER = 0.68;
const weapons = {
  "Pumpkin Launcher": { damage: 48, rate: 850, speed: 390, spread: 0.035, ammo: 8, reload: 1500, radius: 78, color: "#ff7a18" },
  "Sawed-Off Shotgun": { damage: 14, rate: 720, speed: 560, spread: 0.42, pellets: 7, ammo: 6, reload: 1250, color: "#f5bd68" },
  "Werewolf SMG": { damage: 10, rate: 105, speed: 700, spread: 0.14, ammo: 32, reload: 1150, color: "#ff4f79" },
  "Skeleton AR": { damage: 18, rate: 230, speed: 850, spread: 0.055, ammo: 24, reload: 1300, color: "#e9e6d6" },
  "Spider Minigun": { damage: 8, rate: 75, speed: 760, spread: 0.2, ammo: 55, reload: 1900, color: "#bd8cff" },
  "Spooky Pistol": { damage: 22, rate: 360, speed: 740, spread: 0.035, ammo: 14, reload: 950, color: "#85e7d2" },
  "Spooky Shotgun": { damage: 11, rate: 600, speed: 600, spread: 0.28, pellets: 6, ammo: 8, reload: 1350, color: "#baff6b" },
  "Sniper Rifle": { damage: 110, rate: 1250, speed: 1100, spread: 0.008, ammo: 5, reload: 1800, color: "#dfeaf8" },
  "Arc Blaster": { damage: 30, rate: 220, speed: 860, spread: 0.12, ammo: 18, reload: 1200, color: "#7ce8ff" },
  "Bone Cannon": { damage: 42, rate: 600, speed: 620, spread: 0.16, pellets: 3, ammo: 12, reload: 1400, color: "#e9d9b1" }
};
const outfits = {
  "Ghost": { color: "#e9f4ff", model: "ghost", ability: "Phantom Step", description: "+10% movement speed." },
  "Pumpkin": { color: "#ff8b22", model: "pumpkin", ability: "Fortify", description: "+15 max health and 1 health regenerated per second." },
  "Skeleton": { color: "#ddd9c8", model: "skeleton", ability: "Bone Guard", description: "+12% damage and take 8% less damage." },
  "Werewolf": { color: "#8d755f", model: "werewolf", ability: "Blood Rush", description: "+25% damage." },
  "Witch": { color: "#a87bd1", model: "witch", ability: "Hex Burst", description: "+12% fire rate." },
  "Vampire": { color: "#b84252", model: "vampire", ability: "Siphon", description: "Heal 6 health from each elimination and 2 from each pickup." }
};
const cursedGear = {
  fangs: { name: "Vampire Fangs", description: "+15% damage, heal 4 on elimination", damage: 1.15, healOnKill: 4 },
  bulwark: { name: "Grave Bulwark", description: "+30 max health, -10% speed", health: 30, speed: 0.9 },
  haste: { name: "Witch's Haste", description: "+20% speed, -10% damage", speed: 1.2, damage: 0.9 },
  bargain: { name: "Cursed Bargain", description: "+35% damage, -25 max health", damage: 1.35, health: -25 },
  scavenger: { name: "Soul Scavenger", description: "+2 ammo on pickup, +10 max health", health: 10, ammoOnPickup: 2 },
  veil: { name: "Veil of Ash", description: "+5% speed, +6 max health, -5% fire rate", health: 6, fireRate: 0.95, speed: 1.05 },
  marrow: { name: "Marrow Breaker", description: "+20% damage, +6 max health", damage: 1.2, health: 6 }
};
const accessoryBonuses = {
  "Bat companion": { damage: 1.08, heal: 0.5 },
  "Floating lantern": { vision: 1.15, damage: 1.04 },
  "Graveyard chains": { health: 18, speed: 0.95 },
  "Hex charm": { fireRate: 1.08, damage: 1.04 },
  "Wolf charm": { speed: 1.08, damage: 1.08 }
};
const buildings = [
  { x: 260, y: 240, w: 300, h: 220, color: "#554b41" },
  { x: 820, y: 200, w: 250, h: 300, color: "#4b5148" },
  { x: 1420, y: 280, w: 360, h: 220, color: "#625045" },
  { x: 2200, y: 180, w: 300, h: 320, color: "#514c5d" },
  { x: 3050, y: 240, w: 320, h: 240, color: "#635346" },
  { x: 360, y: 840, w: 340, h: 300, color: "#4b5148" },
  { x: 1120, y: 900, w: 280, h: 240, color: "#635346" },
  { x: 1830, y: 760, w: 420, h: 340, color: "#514c5d" },
  { x: 2700, y: 880, w: 300, h: 270, color: "#554b41" },
  { x: 320, y: 1660, w: 380, h: 280, color: "#625045" },
  { x: 1100, y: 1700, w: 300, h: 320, color: "#514c5d" },
  { x: 1760, y: 1580, w: 320, h: 260, color: "#4b5148" },
  { x: 2420, y: 1680, w: 420, h: 300, color: "#635346" },
  { x: 3150, y: 1600, w: 280, h: 360, color: "#554b41" },
  { x: 3900, y: 300, w: 370, h: 270, color: "#625045" },
  { x: 4800, y: 420, w: 320, h: 340, color: "#514c5d" },
  { x: 3860, y: 1050, w: 430, h: 330, color: "#4b5148" },
  { x: 4900, y: 1500, w: 380, h: 280, color: "#554b41" },
  { x: 3820, y: 2060, w: 320, h: 310, color: "#635346" },
  { x: 4660, y: 2380, w: 420, h: 330, color: "#514c5d" },
  { x: 3620, y: 3000, w: 390, h: 300, color: "#554b41" },
  { x: 4750, y: 3290, w: 430, h: 300, color: "#625045" },
  { x: 2280, y: 2760, w: 390, h: 300, color: "#635346" },
  { x: 1180, y: 2700, w: 380, h: 340, color: "#4b5148" },
  { x: 1800, y: 3320, w: 350, h: 300, color: "#514c5d" }
];
const walls = [
  { x: 730, y: 650, w: 330, h: 24 }, { x: 1120, y: 650, w: 24, h: 240 },
  { x: 1500, y: 600, w: 300, h: 24 }, { x: 2430, y: 650, w: 24, h: 230 },
  { x: 2880, y: 650, w: 340, h: 24 }, { x: 760, y: 1320, w: 24, h: 260 },
  { x: 1480, y: 1280, w: 340, h: 24 }, { x: 2220, y: 1300, w: 24, h: 270 },
  { x: 2920, y: 1320, w: 350, h: 24 }, { x: 820, y: 2180, w: 340, h: 24 },
  { x: 1500, y: 2080, w: 24, h: 230 }, { x: 2230, y: 2180, w: 350, h: 24 }
];
const buildingWalls = buildings.flatMap((building) => {
  const doorWidth = 72;
  const sideWidth = (building.w - doorWidth) / 2;
  return [
    { x: building.x, y: building.y, w: building.w, h: 16 },
    { x: building.x, y: building.y, w: 16, h: building.h },
    { x: building.x + building.w - 16, y: building.y, w: 16, h: building.h },
    { x: building.x, y: building.y + building.h - 16, w: sideWidth, h: 16 },
    { x: building.x + sideWidth + doorWidth, y: building.y + building.h - 16, w: sideWidth, h: 16 }
  ];
});
const obstacles = [...walls, ...buildingWalls];
const pillars = [
  { x: 650, y: 560 }, { x: 1200, y: 620 }, { x: 2040, y: 560 },
  { x: 2700, y: 620 }, { x: 900, y: 1450 }, { x: 2050, y: 1370 },
  { x: 4000, y: 800 }, { x: 5100, y: 1120 }, { x: 4000, y: 1700 },
  { x: 5300, y: 2200 }, { x: 4200, y: 2900 }, { x: 5100, y: 3650 }
];

let player;
let fighters = [];
let bullets = [];
let pickups = [];
let particles = [];
let smokeClouds = [];
let keys = new Set();
let mouse = { x: 0, y: 0, down: false, rightDown: false };
let camera = { x: WORLD.width / 2, y: WORLD.height / 2 };
let scopeFocus = 0;
let scopeTarget = null;
let gameRunning = false;
let gamePaused = false;
let lastFrame = 0;
let elapsed = 0;
let selectedMode = "solo";
let spawnMode = "drop";
let accessory = "None";
let startingItem = "Medkit";
let cursedChoicePending = false;
let cursedRewardsPending = 0;
let weaponWheelOpen = false;
let wheelWeaponNames = [];
let selectedWheelIndex = 0;
let pendingLevelUps = 0;
let progressionPending = false;
let persistentRespawnTimer = 0;
mouse.rightDown = false;
scopeFocus = 0;
scopeTarget = null;
let persistentSpawnTimer = 0;
const online = {
  active: false, host: false, roomCode: "", playerId: "", serverUrl: "",
  mode: "solo", playerCount: 1, pollTimer: 0, currentRoom: null, launched: false
};
const MAX_LEVEL = 25;
const levelStats = [
  { id: "damage", name: "Bullet Damage", description: "+10% damage each rank", max: 5 },
  { id: "fireRate", name: "Fire Rate", description: "Shoot 8% faster each rank", max: 5 },
  { id: "bulletSpeed", name: "Bullet Speed", description: "Bullets travel 10% faster each rank", max: 5 },
  { id: "health", name: "Max Health", description: "+20 max health each rank", max: 5 },
  { id: "movement", name: "Move Speed", description: "+7% movement speed each rank", max: 5 },
  { id: "regeneration", name: "Regeneration", description: "Restore 1 health per second each rank", max: 5 }
];

function getWeaponDefinition(name) {
  return weapons[name] || weapons["Spooky Pistol"];
}

function applyAccessoryBonus(fighter) {
  if (!fighter.accessory || fighter.accessory === "None") return;
  const perk = accessoryBonuses[fighter.accessory] || {};
  if (perk.health) { fighter.maxHealth += perk.health; fighter.health += perk.health; }
  if (perk.speed) fighter.speedMultiplier *= perk.speed;
  if (perk.damage) fighter.damageMultiplier *= perk.damage;
  if (perk.fireRate) fighter.fireRateMultiplier *= perk.fireRate;
  if (perk.heal) fighter.regeneration += perk.heal;
  if (perk.vision) fighter.visionMultiplier *= perk.vision;
}

function applyOutfitPassive(fighter) {
  const outfit = outfits[fighter.outfit] || {};
  if (!outfit.ability) return;
  if (fighter.outfit === "Ghost") fighter.speedMultiplier *= 1.1;
  if (fighter.outfit === "Pumpkin") { fighter.maxHealth += 15; fighter.health += 15; fighter.regeneration += 1; }
  if (fighter.outfit === "Skeleton") fighter.damageMultiplier *= 1.12;
  if (fighter.outfit === "Werewolf") fighter.damageMultiplier *= 1.25;
  if (fighter.outfit === "Witch") fighter.fireRateMultiplier *= 1.12;
  if (fighter.outfit === "Vampire") {
    fighter.healOnElimination = (fighter.healOnElimination || 0) + 6;
    fighter.healOnPickup = (fighter.healOnPickup || 0) + 2;
  }
}

function makeFighter(name, x, y, team, isPlayer, outfit, weaponName) {
  const weapon = getWeaponDefinition(weaponName);
  const baseSpeed = isPlayer ? 245 : 150 + Math.random() * 30;
  const fighter = {
    name, x, y, team, isPlayer, outfit, weaponName, health: 100, maxHealth: 100,
    speed: baseSpeed, baseSpeed,
    radius: 17,
    ammo: weapon.ammo, reserve: weapon.ammo * 3, kills: 0,
    ownedWeapons: [weaponName], weaponAmmo: { [weaponName]: weapon.ammo }, weaponReserve: { [weaponName]: weapon.ammo * 3 },
    xp: 0, level: 1, xpToNext: 100, statRanks: { damage: 0, fireRate: 0, bulletSpeed: 0, health: 0, movement: 0, regeneration: 0 },
    xpDamageMultiplier: 1, fireRateMultiplier: 1, bulletSpeedMultiplier: 1, regeneration: 0,
    nextShot: 0, reloading: false, reloadEnd: 0, damageMultiplier: 1,
    weaponColor: weapon.color, alive: true, botAngle: Math.random() * Math.PI * 2, angle: Math.random() * Math.PI * 2,
    botTurnAt: 0, spawnProtectedUntil: 3000, speedMultiplier: 1,
    visionMultiplier: 1, movementBoostUntil: 0, movementBoostMultiplier: 1,
    dashUntil: 0, dashDirectionX: 0, dashDirectionY: 0,
    roofBuildingIndex: -1,
    botTarget: null, botThinkAt: 0, botLastSeenX: x, botLastSeenY: y,
    curses: [], nextCurseAt: isPlayer ? 5 : 10,
    accessory: isPlayer ? accessory : "None",
    respawnTimer: 0
  };
  applyOutfitPassive(fighter);
  applyAccessoryBonus(fighter);
  fighter.speed = fighter.baseSpeed * fighter.speedMultiplier * (1 + (fighter.statRanks.movement || 0) * 0.07);
  fighter.health = Math.min(fighter.maxHealth, fighter.health);
  return fighter;
}

function circleHitsObstacle(x, y, radius) {
  return obstacles.some((rect) => {
    const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    return Math.hypot(x - closestX, y - closestY) < radius;
  });
}

function segmentIntersectsRect(x1, y1, x2, y2, rect) {
  let low = 0;
  let high = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const axes = [
    [-dx, x1 - rect.x],
    [dx, rect.x + rect.w - x1],
    [-dy, y1 - rect.y],
    [dy, rect.y + rect.h - y1]
  ];
  for (const [p, q] of axes) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const ratio = q / p;
    if (p < 0) low = Math.max(low, ratio);
    else high = Math.min(high, ratio);
    if (low > high) return false;
  }
  return true;
}

function lineIntersectsRect(x1, y1, x2, y2, rect) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < rect.x || minX > rect.x + rect.w || maxY < rect.y || minY > rect.y + rect.h) return false;
  return segmentIntersectsRect(x1, y1, x2, y2, rect);
}

function hasLineOfSight(x1, y1, x2, y2, elevated = false) {
  const blockingObstacles = elevated ? buildingWalls : obstacles;
  if (blockingObstacles.some((rect) => lineIntersectsRect(x1, y1, x2, y2, rect))) return false;
  return !smokeClouds.some((cloud) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((cloud.x - x1) * dx + (cloud.y - y1) * dy) / lengthSq));
    return Math.hypot(x1 + t * dx - cloud.x, y1 + t * dy - cloud.y) < cloud.radius;
  });
}

function hasLineOfSightToFighter(source, target, elevated = false) {
  const offsets = [
    [0, 0], [-target.radius * 0.7, 0], [target.radius * 0.7, 0],
    [0, -target.radius * 0.7], [0, target.radius * 0.7]
  ];
  return offsets.some(([offsetX, offsetY]) =>
    hasLineOfSight(source.x, source.y, target.x + offsetX, target.y + offsetY, elevated));
}

function getStormRadius() {
  const maximumRadius = Math.hypot(WORLD.width, WORLD.height) / 2 + 200;
  const closingProgress = Math.max(0, Math.min(1, (elapsed - STORM.delay) / STORM.duration));
  return maximumRadius - closingProgress * (maximumRadius - STORM.minimumRadius);
}

function isScoped() {
  return Boolean(gameRunning && player && player.weaponName === "Sniper Rifle" && mouse.rightDown);
}

function getCameraZoom() {
  if (isScoped()) return SCOPE_WIDE_ZOOM + (SCOPE_FOCUSED_ZOOM - SCOPE_WIDE_ZOOM) * scopeFocus;
  return player && player.roofBuildingIndex >= 0 ? ROOF_VIEW_ZOOM : 1;
}

function getMouseWorldPosition() {
  const zoom = getCameraZoom();
  return {
    x: camera.x + (mouse.x - canvas.width / 2) / zoom,
    y: camera.y + (mouse.y - canvas.height / 2) / zoom
  };
}

function updateCamera() {
  if (!player) return;
  const zoom = getCameraZoom();
  const aimOffsetX = isScoped() ? (mouse.x - canvas.width / 2) / zoom * 0.22 : 0;
  const aimOffsetY = isScoped() ? (mouse.y - canvas.height / 2) / zoom * 0.22 : 0;
  const halfWidth = canvas.width / (2 * zoom);
  const halfHeight = canvas.height / (2 * zoom);
  const focusOffsetX = isScoped() && scopeTarget ? (mouse.x - canvas.width / 2) / zoom : 0;
  const focusOffsetY = isScoped() && scopeTarget ? (mouse.y - canvas.height / 2) / zoom : 0;
  const targetX = scopeTarget && isScoped() ? scopeTarget.x - focusOffsetX : player.x + aimOffsetX;
  const targetY = scopeTarget && isScoped() ? scopeTarget.y - focusOffsetY : player.y + aimOffsetY;
  camera.x = Math.max(halfWidth, Math.min(WORLD.width - halfWidth, targetX));
  camera.y = Math.max(halfHeight, Math.min(WORLD.height - halfHeight, targetY));
}

function canPlayerSee(x, y, elevatedTarget = false) {
  const elevated = player && player.roofBuildingIndex >= 0;
  const visionRange = (elevated ? 2400 : isScoped() ? 2000 : 1400) *
    (player ? player.visionMultiplier : 1);
  return Math.hypot(x - player.x, y - player.y) <= visionRange &&
    hasLineOfSight(player.x, player.y, x, y, elevated || elevatedTarget);
}

function canPlayerSeeFighter(fighter) {
  const elevated = player && player.roofBuildingIndex >= 0;
  const visionRange = (elevated ? 2400 : isScoped() ? 2000 : 1400) *
    (player ? player.visionMultiplier : 1);
  return Math.hypot(fighter.x - player.x, fighter.y - player.y) <= visionRange &&
    hasLineOfSightToFighter(player, fighter,
      elevated || fighter.roofBuildingIndex >= 0);
}

function findScopeTarget() {
  if (!isScoped()) return null;
  const aim = getMouseWorldPosition();
  let closest = null;
  let closestDistance = Infinity;
  for (const fighter of fighters) {
    if (!fighter.alive || fighter === player || fighter.team === player.team) continue;
    if (fighter.roofBuildingIndex >= 0 && !isAtRoofEdge(fighter)) continue;
    if (!canPlayerSeeFighter(fighter)) continue;
    const distance = Math.hypot(fighter.x - aim.x, fighter.y - aim.y);
    if (distance <= Math.max(20, fighter.radius + 12 / getCameraZoom()) && distance < closestDistance) {
      closest = fighter;
      closestDistance = distance;
    }
  }
  return closest;
}

function updateScopeFocus(dt) {
  if (!isScoped()) {
    scopeFocus = 0;
    scopeTarget = null;
    return;
  }
  const target = findScopeTarget();
  if (target) {
    if (scopeTarget === target) {
      scopeFocus = Math.min(1, scopeFocus + dt / SCOPE_FOCUS_TIME);
    } else {
      scopeTarget = target;
      scopeFocus = 0;
    }
  } else {
    scopeTarget = null;
    scopeFocus = Math.max(0, scopeFocus - dt * 1.5);
  }
}

function distanceToBuilding(building, x, y) {
  const outsideX = Math.max(building.x - x, 0, x - (building.x + building.w));
  const outsideY = Math.max(building.y - y, 0, y - (building.y + building.h));
  if (outsideX || outsideY) return Math.hypot(outsideX, outsideY);
  return Math.min(x - building.x, building.x + building.w - x, y - building.y, building.y + building.h - y);
}

function getRoofEdge(fighter) {
  if (fighter.roofBuildingIndex < 0) return null;
  const building = buildings[fighter.roofBuildingIndex];
  if (!building) return null;
  const edges = [
    { side: "left", distance: fighter.x - (building.x + 16 + fighter.radius), nx: -1, ny: 0 },
    { side: "right", distance: building.x + building.w - 16 - fighter.radius - fighter.x, nx: 1, ny: 0 },
    { side: "top", distance: fighter.y - (building.y + 16 + fighter.radius), nx: 0, ny: -1 },
    { side: "bottom", distance: building.y + building.h - 16 - fighter.radius - fighter.y, nx: 0, ny: 1 }
  ];
  return edges.sort((a, b) => a.distance - b.distance)[0];
}

function isAtRoofEdge(fighter) {
  const edge = getRoofEdge(fighter);
  return Boolean(edge && edge.distance <= ROOF_EDGE_DEPTH);
}

function moveOnRoof(fighter, dx, dy) {
  const building = buildings[fighter.roofBuildingIndex];
  if (!building) {
    fighter.roofBuildingIndex = -1;
    return;
  }
  fighter.x = Math.max(building.x + 16 + fighter.radius + 2,
    Math.min(building.x + building.w - 16 - fighter.radius - 2, fighter.x + dx));
  fighter.y = Math.max(building.y + 16 + fighter.radius + 2,
    Math.min(building.y + building.h - 16 - fighter.radius - 2, fighter.y + dy));
}

function togglePlayerRoof() {
  if (!player || !player.alive || gamePaused || !gameRunning) return;
  if (player.roofBuildingIndex >= 0) {
    const building = buildings[player.roofBuildingIndex];
    player.roofBuildingIndex = -1;
    player.x = building.x + building.w / 2;
    player.y = building.y + building.h + player.radius + 4;
    statusText.textContent = "Climbed down through the building entrance.";
    updateCamera();
    return;
  }
  let closestIndex = -1;
  let closestDistance = 56;
  buildings.forEach((building, index) => {
    const distance = distanceToBuilding(building, player.x, player.y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  if (closestIndex < 0) {
    statusText.textContent = "Move close to a building edge to climb.";
    return;
  }
  const building = buildings[closestIndex];
  const edgeDistances = [
    { side: "left", distance: Math.abs(player.x - building.x) },
    { side: "right", distance: Math.abs(player.x - (building.x + building.w)) },
    { side: "top", distance: Math.abs(player.y - building.y) },
    { side: "bottom", distance: Math.abs(player.y - (building.y + building.h)) }
  ];
  const side = edgeDistances.sort((a, b) => a.distance - b.distance)[0].side;
  const inset = 16 + player.radius + 2;
  player.x = Math.max(building.x + inset,
    Math.min(building.x + building.w - inset, player.x));
  player.y = Math.max(building.y + inset,
    Math.min(building.y + building.h - inset, player.y));
  if (side === "left") player.x = building.x + inset + 2;
  if (side === "right") player.x = building.x + building.w - inset - 2;
  if (side === "top") player.y = building.y + inset + 2;
  if (side === "bottom") player.y = building.y + building.h - inset - 2;
  player.roofBuildingIndex = closestIndex;
  statusText.textContent = "On rooftop: move slower; you can shoot and be hit only near an edge.";
  updateCamera();
}

function randomSpawn(occupied = [], minDistance = 190) {
  let point;
  for (let attempt = 0; attempt < 1200; attempt++) {
    point = { x: 100 + Math.random() * (WORLD.width - 200), y: 100 + Math.random() * (WORLD.height - 200) };
    if (!circleHitsObstacle(point.x, point.y, 26) &&
      occupied.every((fighter) => Math.hypot(fighter.x - point.x, fighter.y - point.y) >= minDistance)) return point;
  }
  const fallback = { x: 3000, y: 2000 };
  if (!circleHitsObstacle(fallback.x, fallback.y, 26)) return fallback;
  for (let y = 100; y < WORLD.height; y += 80) {
    for (let x = 100; x < WORLD.width; x += 80) {
      if (!circleHitsObstacle(x, y, 26) &&
        occupied.every((fighter) => Math.hypot(fighter.x - x, fighter.y - y) >= minDistance)) return { x, y };
    }
  }
  return fallback;
}

function spawnBot() {
  const point = randomSpawn(fighters, 220);
  const botWeapon = Object.keys(weapons)[Math.floor(Math.random() * Object.keys(weapons).length)];
  const botOutfit = Object.keys(outfits)[Math.floor(Math.random() * Object.keys(outfits).length)];
  const deadBotIndex = fighters.findIndex((fighter) => !fighter.isPlayer && !fighter.alive);
  const botIndex = deadBotIndex >= 0 ? deadBotIndex : fighters.length;
  const botName = `Ghoul ${botIndex}`;
  const botTeam = selectedMode === "teams" ? 2 : online.active
    ? online.playerCount + botIndex + 1
    : botIndex + 1;
  const bot = makeFighter(botName, point.x, point.y, botTeam, false, botOutfit, botWeapon);
  if (deadBotIndex >= 0) fighters[deadBotIndex] = bot;
  else fighters.push(bot);
  return bot;
}

function respawnPlayer() {
  if (!player) return;
  const spawn = randomSpawn([], 230);
  player.x = spawn.x;
  player.y = spawn.y;
  player.alive = true;
  player.health = player.maxHealth;
  player.ammo = weapons[player.weaponName].ammo;
  player.reserve = Math.max(player.reserve, weapons[player.weaponName].ammo * 2);
  player.respawnTimer = 0;
  statusText.textContent = "You rose from the grave and re-entered the fight.";
}

function onlineStatus(message) {
  document.querySelector("#online-status").textContent = message;
}

function getOnlineServerUrl() {
  const value = document.querySelector("#server-url").value.trim().replace(/\/+$/, "");
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("The Render server URL must start with https://.");
  }
  return value;
}

async function onlineRequest(path, options = {}) {
  const response = await fetch(`${online.serverUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`The multiplayer server returned an invalid response (${response.status}).`);
  }
  if (!response.ok) throw new Error(result.error || `Multiplayer request failed (${response.status}).`);
  return result;
}

function renderOnlineRoom(room) {
  online.currentRoom = room;
  online.host = room.hostId === online.playerId;
  online.mode = room.mode;
  online.playerCount = room.players.length;
  document.querySelector("#online-room-panel").hidden = false;
  document.querySelector("#online-room-code").textContent = room.code;
  document.querySelector("#online-room-mode").textContent =
    `${room.mode[0].toUpperCase()}${room.mode.slice(1)} · ${room.players.length} / ${MATCH_FIGHTER_LIMIT} players`;
  const list = document.querySelector("#online-player-list");
  const roster = room.players.map((entry) =>
    `${entry.id}:${entry.name}:${entry.host ? "host" : ""}:${entry.id === online.playerId ? "you" : ""}`
  ).join("|");
  if (list.dataset.roster !== roster) {
    list.replaceChildren();
    room.players.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `${entry.name}${entry.host ? " (host)" : ""}${entry.id === online.playerId ? " (you)" : ""}`;
      list.appendChild(item);
    });
    list.dataset.roster = roster;
  }
  const startButton = document.querySelector("#start-online-match");
  startButton.hidden = !online.host || room.started;
  if (room.started && !online.launched) {
    online.launched = true;
    modeSelect.value = room.mode;
    startGame();
  }
  if (gameRunning) syncRemotePlayers(room);
}

function syncRemotePlayers(room) {
  if (!player || !online.active) return;
  const remotePlayers = room.players.filter((entry) => entry.id !== online.playerId);
  const self = room.players.find((entry) => entry.id === online.playerId);
  const currentIds = new Set(remotePlayers.map((entry) => entry.id));
  fighters = fighters.filter((fighter) => !fighter.isRemote || currentIds.has(fighter.networkId));
  for (const entry of remotePlayers) {
    let remote = fighters.find((fighter) => fighter.isRemote && fighter.networkId === entry.id);
    if (!remote) {
      const point = randomSpawn(fighters, 120);
      remote = makeFighter(entry.name, point.x, point.y, entry.team, false,
        outfits[entry.state?.outfit] ? entry.state.outfit : "Ghost",
        weapons[entry.state?.weaponName] ? entry.state.weaponName : "Spooky Pistol");
      remote.isRemote = true;
      remote.networkId = entry.id;
      fighters.push(remote);
    }
    remote.name = entry.name;
    remote.team = entry.team;
    const state = entry.state;
    if (state && Number.isFinite(state.x) && Number.isFinite(state.y)) {
      remote.x = Math.max(remote.radius, Math.min(WORLD.width - remote.radius, state.x));
      remote.y = Math.max(remote.radius, Math.min(WORLD.height - remote.radius, state.y));
      remote.angle = Number.isFinite(state.angle) ? state.angle : remote.angle;
      remote.health = Number.isFinite(state.health) ? Math.max(0, Math.min(remote.maxHealth, state.health)) : remote.health;
      remote.alive = state.alive !== false;
      if (weapons[state.weaponName]) remote.weaponName = state.weaponName;
      if (outfits[state.outfit]) remote.outfit = state.outfit;
      remote.kills = Number.isFinite(state.kills) ? state.kills : remote.kills;
    }
  }
  for (const event of self?.damageEvents || []) {
    if (!player.alive || !Number.isFinite(event.amount)) continue;
    const attacker = fighters.find((fighter) => fighter.isRemote && fighter.networkId === event.attackerId);
    damage(player, event.amount, attacker || null);
  }
}

function sendNetworkDamage(target, amount, attacker) {
  if (!online.active || !attacker?.isPlayer || !target.isRemote || !Number.isFinite(amount)) return;
  onlineRequest(`/api/rooms/${online.roomCode}/damage`, {
    method: "POST",
    body: JSON.stringify({ attackerId: online.playerId, victimId: target.networkId, amount })
  }).catch((error) => onlineStatus(`Could not send hit: ${error.message}`));
}

function publishLocalPlayerState() {
  if (!online.active || !player || !gameRunning) return Promise.resolve(null);
  return onlineRequest(`/api/rooms/${online.roomCode}/players/${online.playerId}`, {
    method: "POST",
    body: JSON.stringify({
      x: player.x, y: player.y, angle: player.angle, health: player.health,
      alive: player.alive, weaponName: player.weaponName, outfit: player.outfit, kills: player.kills
    })
  });
}

async function pollOnlineRoom() {
  if (!online.active) return;
  try {
    const result = gameRunning
      ? await publishLocalPlayerState()
      : await onlineRequest(
          `/api/rooms/${online.roomCode}?playerId=${encodeURIComponent(online.playerId)}`
        );
    if (result?.room) renderOnlineRoom(result.room);
    if (gameRunning) onlineStatus(`Connected · room ${online.roomCode} · ${online.playerCount} real player(s)`);
  } catch (error) {
    onlineStatus(`Multiplayer connection problem: ${error.message}`);
  } finally {
    if (online.active) online.pollTimer = window.setTimeout(pollOnlineRoom, 250);
  }
}

function beginOnlinePolling() {
  window.clearTimeout(online.pollTimer);
  online.pollTimer = window.setTimeout(pollOnlineRoom, 0);
}

async function createOnlineRoom() {
  try {
    online.serverUrl = getOnlineServerUrl();
    online.mode = document.querySelector("#online-mode").value;
    const result = await onlineRequest("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ name: document.querySelector("#online-name").value, mode: online.mode })
    });
    online.active = true;
    online.host = true;
    online.launched = false;
    online.roomCode = result.room.code;
    online.playerId = result.playerId;
    renderOnlineRoom(result.room);
    onlineStatus("Lobby created. Share the room code; only the host can start the match.");
    beginOnlinePolling();
  } catch (error) {
    onlineStatus(`Could not create lobby: ${error.message}`);
  }
}

async function joinOnlineRoom() {
  try {
    online.serverUrl = getOnlineServerUrl();
    const code = document.querySelector("#room-code").value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error("Enter the six-character room code.");
    const result = await onlineRequest(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name: document.querySelector("#online-name").value })
    });
    online.active = true;
    online.host = false;
    online.launched = false;
    online.roomCode = result.room.code;
    online.playerId = result.playerId;
    renderOnlineRoom(result.room);
    onlineStatus("Joined lobby. Wait for the host to start the match.");
    beginOnlinePolling();
  } catch (error) {
    onlineStatus(`Could not join lobby: ${error.message}`);
  }
}

async function startOnlineMatch() {
  try {
    const mode = document.querySelector("#online-mode").value;
    const result = await onlineRequest(`/api/rooms/${online.roomCode}/start`, {
      method: "POST",
      body: JSON.stringify({ playerId: online.playerId, mode })
    });
    modeSelect.value = result.room.mode;
    renderOnlineRoom(result.room);
  } catch (error) {
    onlineStatus(`Could not start match: ${error.message}`);
  }
}

async function leaveOnlineRoom() {
  if (!online.active) return;
  const leaveRequest = onlineRequest(`/api/rooms/${online.roomCode}/leave`, {
    method: "POST",
    body: JSON.stringify({ playerId: online.playerId })
  });
  online.active = false;
  window.clearTimeout(online.pollTimer);
  online.roomCode = "";
  online.playerId = "";
  online.host = false;
  online.launched = false;
  online.currentRoom = null;
  online.playerCount = 1;
  document.querySelector("#online-room-panel").hidden = true;
  try {
    await leaveRequest;
    onlineStatus("Left online lobby.");
  } catch (error) {
    onlineStatus(`Left locally, but server cleanup failed: ${error.message}`);
  }
}

function startGame() {
  selectedMode = modeSelect.value;
  spawnMode = startModeSelect.value;
  accessory = accessorySelect.value;
  startingItem = startingItemSelect.value;
  const spawn = spawnMode === "pillars"
    ? { ...pillars[0], x: pillars[0].x + (Math.random() - 0.5) * 90, y: pillars[0].y + (Math.random() - 0.5) * 90 }
    : randomSpawn([], 230);
  const playerIndex = online.active && online.currentRoom
    ? online.currentRoom.players.findIndex((entry) => entry.id === online.playerId)
    : 0;
  const playerTeam = selectedMode === "teams" ? 1 : online.active
    ? Math.max(1, playerIndex + 1)
    : 0;
  player = makeFighter("You", spawn.x, spawn.y, playerTeam, true, outfitSelect.value, weaponSelect.value);
  fighters = [player];

  const realPlayerCount = Math.min(online.active ? online.playerCount : 1, MATCH_FIGHTER_LIMIT);
  const totalBots = MATCH_FIGHTER_LIMIT - realPlayerCount;
  const botTeams = Array.from({ length: totalBots }, (_, index) =>
    selectedMode === "teams" ? 2 : online.active ? realPlayerCount + index + 1 : index + 1);
  botTeams.forEach((team, i) => {
    const point = spawnMode === "pillars"
      ? { ...pillars[(i % (pillars.length - 1)) + 1], x: pillars[(i % (pillars.length - 1)) + 1].x + (Math.random() - 0.5) * 70, y: pillars[(i % (pillars.length - 1)) + 1].y + (Math.random() - 0.5) * 70 }
      : randomSpawn(fighters, 230);
    const botWeapon = Object.keys(weapons)[Math.floor(Math.random() * Object.keys(weapons).length)];
    fighters.push(makeFighter(`Ghoul ${i + 1}`, point.x, point.y, team, false, Object.keys(outfits)[i % Object.keys(outfits).length], botWeapon));
  });
  if (online.active && online.currentRoom) syncRemotePlayers(online.currentRoom);
  persistentSpawnTimer = selectedMode === "persistent" ? 3.5 : 0;

  bullets = [];
  particles = [];
  smokeClouds = [];
  pickups = [];
  elapsed = 0;
  lastFrame = 0;
  cursedChoicePending = false;
  cursedRewardsPending = 0;
  weaponWheelOpen = false;
  mouse.rightDown = false;
  mouse.down = false;
  scopeFocus = 0;
  scopeTarget = null;
  progressionPending = false;
  pendingLevelUps = 0;
  characterMenu.hidden = true;
  gameRunning = true;
  gamePaused = false;
  characterMenu.style.display = "none";
  arenaScreen.style.display = "block";
  document.querySelector("#exit-match").hidden = selectedMode !== "persistent";
  document.querySelector("#weapon-wheel").hidden = true;
  setCanvasSize();
  gameOver.classList.add("hidden");
  upgradePanel.classList.add("hidden");
  document.querySelector("#level-up-panel").classList.add("hidden");
  statusText.textContent = "";
  makePickups(28);
  if (spawnMode === "pillars") {
    fighters.forEach((fighter) => {
      const weaponName = Object.keys(weapons)[Math.floor(Math.random() * Object.keys(weapons).length)];
      pickups.push({ x: fighter.x + (Math.random() - 0.5) * 85, y: fighter.y + (Math.random() - 0.5) * 85, type: "weapon", weaponName });
    });
  }
  player.itemUses = startingItem === "None" ? 0 : 1;
  if (startingItem === "Ammo pouch") player.reserve += weapons[player.weaponName].ammo;
  refreshWeaponWheel();
  updateProgressHud();
  requestAnimationFrame(loop);
}

function makePickups(amount) {
  for (let i = 0; i < amount; i++) {
    const point = randomSpawn();
    const roll = Math.random();
    if (roll < 0.25) pickups.push({ ...point, type: "health" });
    else if (roll < 0.50) pickups.push({ ...point, type: "ammo" });
    else if (roll < 0.68) pickups.push({ ...point, type: "relic" });
    else if (roll < 0.80) pickups.push({ ...point, type: "movement" });
    else pickups.push({ ...point, type: "weapon", weaponName: Object.keys(weapons)[Math.floor(Math.random() * Object.keys(weapons).length)] });
  }
}

function reload(fighter) {
  if (fighter.reloading || fighter.ammo === weapons[fighter.weaponName].ammo || fighter.reserve <= 0) return;
  fighter.reloading = true;
  fighter.reloadEnd = elapsed + weapons[fighter.weaponName].reload;
}

function equip(fighter, weaponName) {
  if (fighter.weaponName === weaponName) return;
  if (!fighter.ownedWeapons.includes(weaponName)) fighter.ownedWeapons.push(weaponName);
  fighter.weaponAmmo[fighter.weaponName] = fighter.ammo;
  fighter.weaponReserve[fighter.weaponName] = fighter.reserve;
  fighter.weaponName = weaponName;
  fighter.ammo = fighter.weaponAmmo[weaponName] ?? weapons[weaponName].ammo;
  fighter.reserve = fighter.weaponReserve[weaponName] ?? weapons[weaponName].ammo * 2;
  fighter.weaponAmmo[weaponName] = fighter.ammo;
  fighter.weaponReserve[weaponName] = fighter.reserve;
  fighter.reloading = false;
  if (fighter.isPlayer) refreshWeaponWheel();
}

function refreshWeaponWheel() {
  const wheel = document.querySelector("#wheel-content");
  if (!wheel || !player) return;
  wheel.querySelectorAll(".wheel-slot").forEach((slot) => slot.remove());
  wheelWeaponNames = player.ownedWeapons.slice();
  const step = (Math.PI * 2) / Math.max(1, wheelWeaponNames.length);
  wheelWeaponNames.forEach((name, index) => {
    const angle = -Math.PI / 2 + step * index;
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "wheel-slot";
    slot.dataset.weapon = name;
    slot.style.left = `${50 + Math.cos(angle) * 34}%`;
    slot.style.top = `${50 + Math.sin(angle) * 34}%`;
    slot.innerHTML = `${name}<small>${name === player.weaponName ? "EQUIPPED" : "Switch weapon"}</small>`;
    slot.addEventListener("click", () => selectWheelWeapon(index));
    wheel.appendChild(slot);
  });
  updateWheelHighlight();
}

function updateWheelHighlight() {
  if (!weaponWheelOpen || !wheelWeaponNames.length) return;
  const bounds = canvas.getBoundingClientRect();
  const dx = mouse.x - bounds.width / 2;
  const dy = mouse.y - bounds.height / 2;
  if (Math.hypot(dx, dy) < 30) return;
  const angle = Math.atan2(dy, dx);
  const step = (Math.PI * 2) / wheelWeaponNames.length;
  selectedWheelIndex = ((Math.round((angle + Math.PI / 2) / step) % wheelWeaponNames.length) + wheelWeaponNames.length) % wheelWeaponNames.length;
  document.querySelectorAll(".wheel-slot").forEach((slot, index) => {
    slot.classList.toggle("selected", index === selectedWheelIndex);
  });
  const name = wheelWeaponNames[selectedWheelIndex];
  document.querySelector("#wheel-title").textContent = `${name} · release Tab to equip`;
}

function selectWheelWeapon(index) {
  const weaponName = wheelWeaponNames[index];
  if (weaponName) equip(player, weaponName);
  weaponWheelOpen = false;
  document.querySelector("#weapon-wheel").hidden = true;
  gamePaused = false;
  lastFrame = performance.now();
}

function addExperience(fighter, amount) {
  if (!fighter.isPlayer || fighter.level >= MAX_LEVEL) return;
  fighter.xp += amount;
  while (fighter.level < MAX_LEVEL && fighter.xp >= fighter.xpToNext) {
    fighter.xp -= fighter.xpToNext;
    fighter.level++;
    fighter.xpToNext = Math.round(100 + (fighter.level - 1) * 65);
    pendingLevelUps++;
  }
  updateProgressHud();
  showNextRewardPanel();
}

function showNextRewardPanel() {
  if (!player || !player.alive) return;
  if (cursedChoicePending || progressionPending) return;
  gamePaused = false;
  if (cursedRewardsPending > 0) {
    cursedRewardsPending--;
    showCursedGear();
  } else if (pendingLevelUps > 0) {
    showLevelUp();
  }
}

function showLevelUp() {
  if (progressionPending || pendingLevelUps <= 0) return;
  progressionPending = true;
  gamePaused = true;
  const options = document.querySelector("#level-options");
  options.replaceChildren();
  const available = levelStats.filter((stat) => player.statRanks[stat.id] < stat.max);
  const selected = available.sort(() => Math.random() - 0.5).slice(0, 3);
  selected.forEach((stat) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.stat = stat.id;
    button.innerHTML = `${stat.name}<span>${stat.description}<br>Rank ${player.statRanks[stat.id]} / ${stat.max}</span>`;
    button.addEventListener("click", () => chooseLevelStat(stat.id));
    options.appendChild(button);
  });
  if (!selected.length) {
    pendingLevelUps = 0;
    progressionPending = false;
    showNextRewardPanel();
    return;
  }
  document.querySelector("#level-up-panel").classList.remove("hidden");
}

function chooseLevelStat(id) {
  const stat = levelStats.find((entry) => entry.id === id);
  if (!stat || player.statRanks[id] >= stat.max) return;
  player.statRanks[id]++;
  if (id === "damage") player.xpDamageMultiplier *= 1.1;
  if (id === "fireRate") player.fireRateMultiplier *= 1.08;
  if (id === "bulletSpeed") player.bulletSpeedMultiplier *= 1.1;
  if (id === "health") {
    player.maxHealth += 20;
    player.health += 20;
  }
  if (id === "movement") player.speed = player.baseSpeed * player.speedMultiplier * (1 + player.statRanks.movement * 0.07);
  if (id === "regeneration") player.regeneration += 1;
  pendingLevelUps--;
  progressionPending = false;
  document.querySelector("#level-up-panel").classList.add("hidden");
  statusText.textContent = `${stat.name} upgraded to rank ${player.statRanks[id]}`;
  updateProgressHud();
  showNextRewardPanel();
}

function updateProgressHud() {
  if (!player) return;
  document.querySelector("#level-label").textContent = `Level ${player.level}`;
  document.querySelector("#xp-label").textContent = `${player.xp} / ${player.xpToNext} XP`;
  document.querySelector("#xp-fill").style.width = `${Math.min(100, player.xp / player.xpToNext * 100)}%`;
}

function updateWeaponDescription() {
  const weapon = weapons[weaponSelect.value];
  const traits = [
    `${weapon.damage} damage${weapon.pellets ? ` × ${weapon.pellets} pellets` : ""}`,
    `${(1000 / weapon.rate).toFixed(1)} shots/sec`,
    `${weapon.ammo} rounds per magazine`,
    `${(weapon.reload / 1000).toFixed(1)} sec reload`
  ];
  if (weapon.radius) traits.push(`explodes in a ${weapon.radius}px blast`);
  if (weaponSelect.value === "Sniper Rifle") traits.push("hold right mouse for a wider scope view; stay on target to focus and zoom in for accuracy");
  document.querySelector("#weapon-help").textContent =
    `${traits.join(" · ")}. Find other weapon pickups to add them to the Tab weapon wheel.`;
}

function shoot(fighter, angle, now) {
  const weapon = weapons[fighter.weaponName];
  if (fighter.reloading || now < fighter.nextShot) return;
  const roofEdge = fighter.roofBuildingIndex >= 0 ? getRoofEdge(fighter) : null;
  if (roofEdge) {
    const facingOut = Math.cos(angle) * roofEdge.nx + Math.sin(angle) * roofEdge.ny;
    if (roofEdge.distance > ROOF_EDGE_DEPTH || facingOut <= 0.12) {
      if (fighter.isPlayer) statusText.textContent = "Move to a rooftop edge and aim outward to fire.";
      return;
    }
  }
  if (fighter.ammo <= 0) {
    reload(fighter);
    return;
  }
  fighter.nextShot = now + weapon.rate / (fighter.isPlayer ? fighter.fireRateMultiplier : 1) * (fighter.isPlayer ? 1 : 1.4);
  fighter.ammo--;
  fighter.weaponAmmo[fighter.weaponName] = fighter.ammo;
  fighter.weaponReserve[fighter.weaponName] = fighter.reserve;
  const count = weapon.pellets || 1;
  for (let i = 0; i < count; i++) {
    const precision = fighter.isPlayer && fighter.weaponName === "Sniper Rifle" && isScoped()
      ? 1 - scopeFocus * 0.88
      : 1;
    const direction = angle + (Math.random() - 0.5) * weapon.spread * precision;
    if (roofEdge && Math.cos(direction) * roofEdge.nx + Math.sin(direction) * roofEdge.ny <= 0) continue;
    const building = roofEdge ? buildings[fighter.roofBuildingIndex] : null;
    const origin = roofEdge
      ? roofEdge.side === "left" ? { x: building.x - 1, y: fighter.y }
        : roofEdge.side === "right" ? { x: building.x + building.w + 1, y: fighter.y }
          : roofEdge.side === "top" ? { x: fighter.x, y: building.y - 1 }
            : { x: fighter.x, y: building.y + building.h + 1 }
      : { x: fighter.x + Math.cos(direction) * 22, y: fighter.y + Math.sin(direction) * 22 };
    bullets.push({
      x: origin.x, y: origin.y,
      vx: Math.cos(direction) * weapon.speed * (fighter.isPlayer ? fighter.bulletSpeedMultiplier : 1),
      vy: Math.sin(direction) * weapon.speed * (fighter.isPlayer ? fighter.bulletSpeedMultiplier : 1),
      damage: weapon.damage * fighter.damageMultiplier * (fighter.isPlayer ? fighter.xpDamageMultiplier : 0.6), radius: weapon.radius ? 8 : 4,
      blast: weapon.radius || 0, life: weapon.radius ? 1800 : 1100, team: fighter.team,
      owner: fighter, color: weapon.color
    });
  }
}

function nearestEnemy(fighter) {
  const candidates = [];
  for (const other of fighters) {
    if (!other.alive || other === fighter || other.team === fighter.team) continue;
    if (other.roofBuildingIndex >= 0 && !isAtRoofEdge(other)) continue;
    const dx = other.x - fighter.x;
    const dy = other.y - fighter.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < 1500 * 1500) candidates.push({ target: other, distanceSquared });
  }
  candidates.sort((a, b) => a.distanceSquared - b.distanceSquared);
  for (const candidate of candidates) {
    if (hasLineOfSightToFighter(fighter, candidate.target,
      fighter.roofBuildingIndex >= 0 || candidate.target.roofBuildingIndex >= 0)) {
      return { target: candidate.target, distance: Math.sqrt(candidate.distanceSquared) };
    }
  }
  return null;
}

function moveFighterBy(fighter, dx, dy) {
  const nextX = fighter.x + dx;
  const nextY = fighter.y + dy;
  if (!circleHitsObstacle(nextX, nextY, fighter.radius)) {
    fighter.x = nextX;
    fighter.y = nextY;
    return;
  }
  if (!circleHitsObstacle(nextX, fighter.y, fighter.radius)) fighter.x = nextX;
  if (!circleHitsObstacle(fighter.x, nextY, fighter.radius)) fighter.y = nextY;
}

function moveBotToward(fighter, targetX, targetY, dt) {
  const directions = [0, -0.5, 0.5, -1, 1, -1.6, 1.6, Math.PI];
  const desiredAngle = Math.atan2(targetY - fighter.y, targetX - fighter.x);
  let bestX = fighter.x;
  let bestY = fighter.y;
  let bestProgress = 0;
  const currentDistance = Math.hypot(targetX - fighter.x, targetY - fighter.y);
  for (const offset of directions) {
    const angle = desiredAngle + offset;
    const candidateX = fighter.x + Math.cos(angle) * fighter.speed * dt;
    const candidateY = fighter.y + Math.sin(angle) * fighter.speed * dt;
    if (circleHitsObstacle(candidateX, candidateY, fighter.radius)) continue;
    const progress = currentDistance - Math.hypot(targetX - candidateX, targetY - candidateY);
    if (progress > bestProgress) {
      bestProgress = progress;
      bestX = candidateX;
      bestY = candidateY;
    }
  }
  fighter.x = bestX;
  fighter.y = bestY;
}

function getFighterSpeed(fighter) {
  const boost = elapsed < fighter.movementBoostUntil ? fighter.movementBoostMultiplier : 1;
  const dash = elapsed < fighter.dashUntil ? 3 : 1;
  const rooftop = fighter.roofBuildingIndex >= 0 ? ROOF_MOVE_MULTIPLIER : 1;
  return fighter.baseSpeed * fighter.speedMultiplier *
    (1 + fighter.statRanks.movement * 0.07) * boost * dash * rooftop;
}

function moveFighter(fighter, dt) {
  if (fighter.isRemote) return;
  if (fighter.isPlayer) {
    let dx = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    let dy = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
    const length = Math.hypot(dx, dy) || 1;
    if (elapsed < fighter.dashUntil) {
      dx = fighter.dashDirectionX;
      dy = fighter.dashDirectionY;
    } else {
      dx /= length;
      dy /= length;
    }
    fighter.speed = getFighterSpeed(fighter);
    if (fighter.roofBuildingIndex >= 0) moveOnRoof(fighter, dx * fighter.speed * dt, dy * fighter.speed * dt);
    else moveFighterBy(fighter, dx * fighter.speed * dt, dy * fighter.speed * dt);
    const aim = getMouseWorldPosition();
    const angle = Math.atan2(aim.y - fighter.y, aim.x - fighter.x);
    fighter.angle = angle;
    if (mouse.down) shoot(fighter, angle, elapsed);
  } else {
    fighter.speed = getFighterSpeed(fighter);
    if (elapsed >= fighter.botThinkAt) {
      const enemy = nearestEnemy(fighter);
      fighter.botTarget = enemy ? enemy.target : null;
      if (enemy) {
        fighter.botLastSeenX = enemy.target.x;
        fighter.botLastSeenY = enemy.target.y;
        fighter.botLastSeenAt = elapsed;
      }
      fighter.botCanSeeTarget = Boolean(enemy);
      fighter.botThinkAt = elapsed + BOT_RETHINK_MIN + Math.random() * BOT_RETHINK_VARIANCE;
    }
    let target = fighter.botTarget;
    if (target && (!target.alive || target.team === fighter.team)) {
      target = null;
      fighter.botTarget = null;
      fighter.botCanSeeTarget = false;
    }
    if (target && elapsed >= fighter.botLineOfSightCheckAt) {
      fighter.botCanSeeTarget = hasLineOfSightToFighter(fighter, target, fighter.roofBuildingIndex >= 0);
      if (fighter.botCanSeeTarget) {
        fighter.botLastSeenX = target.x;
        fighter.botLastSeenY = target.y;
        fighter.botLastSeenAt = elapsed;
      }
      fighter.botLineOfSightCheckAt = elapsed + 140;
    }
    if (target && fighter.botCanSeeTarget) {
      const distance = Math.hypot(target.x - fighter.x, target.y - fighter.y);
      const weapon = weapons[fighter.weaponName];
      const desiredRange = fighter.weaponName === "Sniper Rifle" ? 560
        : weapon.pellets ? 185
          : weapon.radius ? 360 : 290;
      const angle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
      fighter.angle = angle;
      const incoming = bullets.find((bullet) => bullet.team !== fighter.team &&
        Math.hypot(bullet.x - fighter.x, bullet.y - fighter.y) < 125 &&
        (bullet.x - fighter.x) * bullet.vx + (bullet.y - fighter.y) * bullet.vy < 0);
      if (incoming) {
        const dodgeDirection = angle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
        moveBotToward(fighter, fighter.x + Math.cos(dodgeDirection) * 100,
          fighter.y + Math.sin(dodgeDirection) * 100, dt);
      } else if (distance > desiredRange + 55) {
        moveBotToward(fighter, target.x - Math.cos(angle) * desiredRange,
          target.y - Math.sin(angle) * desiredRange, dt);
      } else if (distance < desiredRange - 70) {
        moveBotToward(fighter, fighter.x - Math.cos(angle) * 120,
          fighter.y - Math.sin(angle) * 120, dt);
      } else {
        const strafeDirection = fighter.botStrafeDirection || 1;
        moveBotToward(fighter,
          fighter.x + Math.cos(angle + strafeDirection * Math.PI / 2) * 100,
          fighter.y + Math.sin(angle + strafeDirection * Math.PI / 2) * 100, dt);
        if (fighter.botCanSeeTarget) {
          shoot(fighter, angle + (Math.random() - 0.5) * 0.11, elapsed);
        }
      }
      if (elapsed > fighter.botTurnAt) {
        fighter.botStrafeDirection = Math.random() < 0.5 ? -1 : 1;
        fighter.botTurnAt = elapsed + 900 + Math.random() * 900;
      }
    } else if (fighter.botTarget && elapsed - (fighter.botLastSeenAt || 0) < 1600) {
      moveBotToward(fighter, fighter.botLastSeenX, fighter.botLastSeenY, dt);
    } else {
      fighter.botTarget = null;
      const nextX = fighter.x + Math.cos(fighter.botAngle) * fighter.speed * 0.4 * dt;
      const nextY = fighter.y + Math.sin(fighter.botAngle) * fighter.speed * 0.4 * dt;
      if (circleHitsObstacle(nextX, nextY, fighter.radius) || elapsed > fighter.botTurnAt) {
        fighter.botAngle += (Math.random() - 0.5) * Math.PI;
        fighter.botTurnAt = elapsed + 700;
      } else {
        fighter.x = nextX;
        fighter.y = nextY;
      }
    }
  }
  fighter.x = Math.max(fighter.radius, Math.min(WORLD.width - fighter.radius, fighter.x));
  fighter.y = Math.max(fighter.radius, Math.min(WORLD.height - fighter.radius, fighter.y));
  if (fighter.reloading && elapsed >= fighter.reloadEnd) {
    const needed = weapons[fighter.weaponName].ammo - fighter.ammo;
    const loaded = Math.min(needed, fighter.reserve);
    fighter.ammo += loaded;
    fighter.reserve -= loaded;
    fighter.reloading = false;
    fighter.weaponAmmo[fighter.weaponName] = fighter.ammo;
    fighter.weaponReserve[fighter.weaponName] = fighter.reserve;
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    const oldX = bullet.x;
    const oldY = bullet.y;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt * 1000;
    const rooftopHit = fighters.find((fighter) => {
      if (!fighter.alive || fighter.team === bullet.team || fighter.roofBuildingIndex < 0 ||
        !isAtRoofEdge(fighter)) return false;
      const segmentX = bullet.x - oldX;
      const segmentY = bullet.y - oldY;
      const segmentLengthSq = segmentX * segmentX + segmentY * segmentY || 1;
      const t = Math.max(0, Math.min(1,
        ((fighter.x - oldX) * segmentX + (fighter.y - oldY) * segmentY) / segmentLengthSq));
      const closestX = oldX + t * segmentX;
      const closestY = oldY + t * segmentY;
      const edge = getRoofEdge(fighter);
      const sourceOutsideEdge = (oldX - fighter.x) * edge.nx + (oldY - fighter.y) * edge.ny > 0;
      return sourceOutsideEdge &&
        Math.hypot(fighter.x - closestX, fighter.y - closestY) <= fighter.radius + bullet.radius;
    });
    if (rooftopHit) {
      if (bullet.blast) explodeBullet(bullet);
      else damage(rooftopHit, bullet.damage, bullet.owner);
      bullets.splice(i, 1);
      continue;
    }
    if (obstacles.some((rect) => segmentIntersectsRect(oldX, oldY, bullet.x, bullet.y, rect))) {
      if (bullet.blast) explodeBullet(bullet);
      bullets.splice(i, 1);
      continue;
    }
    let hit = false;
    for (const fighter of fighters) {
      if (!fighter.alive || fighter.team === bullet.team) continue;
      if (fighter.roofBuildingIndex >= 0 && !isAtRoofEdge(fighter)) continue;
      if (Math.hypot(fighter.x - bullet.x, fighter.y - bullet.y) < fighter.radius + bullet.radius) {
        hit = true;
        if (bullet.blast) {
          explodeBullet(bullet);
        } else {
          damage(fighter, bullet.damage, bullet.owner);
        }
        break;
      }
    }
    if (hit || bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > WORLD.width || bullet.y > WORLD.height) bullets.splice(i, 1);
  }
}

function explodeBullet(bullet) {
  for (const victim of fighters) {
    if (!victim.alive || victim.team === bullet.team ||
      (victim.roofBuildingIndex >= 0 && !isAtRoofEdge(victim)) ||
      !hasLineOfSight(bullet.x, bullet.y, victim.x, victim.y, bullet.owner.roofBuildingIndex >= 0)) continue;
    const distance = Math.hypot(victim.x - bullet.x, victim.y - bullet.y);
    if (distance < bullet.blast) damage(victim, bullet.damage * (1 - distance / bullet.blast), bullet.owner);
  }
  particles.push({ x: bullet.x, y: bullet.y, radius: bullet.blast, life: 350, color: bullet.color });
}

function damage(target, amount, attacker) {
  if (elapsed < target.spawnProtectedUntil) return;
  const armorMitigation = target.outfit === "Skeleton" ? 0.92 : 1;
  const appliedDamage = amount * armorMitigation;
  if (target.isRemote) sendNetworkDamage(target, appliedDamage, attacker);
  target.health -= appliedDamage;
  if (target.health <= 0 && target.alive) {
    target.health = 0;
    target.alive = false;
    if (attacker) {
      attacker.kills++;
      addExperience(attacker, attacker.isPlayer ? 60 : 0);
      const healing = attacker.curses.reduce((total, key) => total + (cursedGear[key].healOnKill || 0), 0);
      attacker.health = Math.min(attacker.maxHealth, attacker.health + healing + (attacker.healOnElimination || 0));
      if (attacker.isPlayer) {
        while (attacker.kills >= attacker.nextCurseAt) {
          attacker.nextCurseAt += 5;
          if (attacker.curses.length < 3) {
            cursedRewardsPending++;
            showNextRewardPanel();
            break;
          }
        }
      } else {
        while (attacker.kills >= attacker.nextCurseAt && attacker.curses.length < 3) {
          attacker.nextCurseAt += 10;
          const choices = Object.keys(cursedGear).filter((key) => !attacker.curses.includes(key));
          if (choices.length) applyCurse(attacker, choices[Math.floor(Math.random() * choices.length)]);
        }
      }
    }
    if (target.isPlayer && selectedMode === "persistent") {
      target.respawnTimer = 2.5;
      statusText.textContent = "You were downed — the arena will respawn you shortly.";
    }
    particles.push({ x: target.x, y: target.y, radius: 28, life: 450, color: outfits[target.outfit].color || "#dbe7ff" });
  }
}

function showCursedGear() {
  if (!player.alive || player.curses.length >= 3) return;
  cursedChoicePending = true;
  gamePaused = true;
  document.querySelectorAll("[data-upgrade]").forEach((button) => {
    const key = button.dataset.upgrade;
    button.classList.toggle("hidden", key !== "skip" && player.curses.includes(key));
    button.disabled = player.curses.length >= 3 && key !== "skip";
  });
  upgradePanel.classList.remove("hidden");
}

function chooseUpgrade(kind) {
  if (kind !== "skip" && cursedGear[kind] && player.curses.length < 3 && !player.curses.includes(kind)) {
    applyCurse(player, kind);
    statusText.textContent = "Cursed gear equipped: " + cursedGear[kind].name;
  } else {
    statusText.textContent = "Cursed gear reward skipped";
  }
  upgradePanel.classList.add("hidden");
  cursedChoicePending = false;
  lastFrame = performance.now();
  showNextRewardPanel();
}

function applyCurse(fighter, key) {
  if (!cursedGear[key] || fighter.curses.length >= 3 || fighter.curses.includes(key)) return;
  const gear = cursedGear[key];
  fighter.curses.push(key);
  fighter.damageMultiplier *= gear.damage || 1;
  fighter.fireRateMultiplier *= gear.fireRate || 1;
  fighter.speedMultiplier *= gear.speed || 1;
  fighter.speed = fighter.baseSpeed * fighter.speedMultiplier * (1 + (fighter.statRanks.movement || 0) * 0.07);
  fighter.maxHealth = Math.max(50, fighter.maxHealth + (gear.health || 0));
  fighter.health = Math.min(fighter.maxHealth, fighter.health + Math.max(0, gear.health || 0));
}

function useStartingItem() {
  if (!player || !player.alive || player.itemUses <= 0 || gamePaused) return;
  if (startingItem === "Medkit") {
    if (player.health >= player.maxHealth) {
      statusText.textContent = "Already at full health";
      return;
    }
    player.health = Math.min(player.maxHealth, player.health + 45);
    statusText.textContent = "Medkit used";
  } else if (startingItem === "Ammo pouch") {
    const reserveIncrease = weapons[player.weaponName].ammo;
    player.reserve += reserveIncrease;
    player.ammo = Math.min(weapons[player.weaponName].ammo, player.ammo + Math.ceil(reserveIncrease / 2));
    statusText.textContent = "Ammo pouch used";
  } else if (startingItem === "Smoke bomb") {
    smokeClouds.push({ x: player.x, y: player.y, radius: 150, life: 6000 });
    statusText.textContent = "Smoke bomb deployed";
  } else if (startingItem === "Dash tonic") {
    let dx = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    let dy = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
    const length = Math.hypot(dx, dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    } else {
      dx = Math.cos(player.angle);
      dy = Math.sin(player.angle);
    }
    player.dashDirectionX = dx;
    player.dashDirectionY = dy;
    player.dashUntil = elapsed + 350;
    statusText.textContent = "Dash tonic used";
  } else if (startingItem === "Haste potion") {
    player.movementBoostMultiplier = 1.5;
    player.movementBoostUntil = elapsed + 7000;
    statusText.textContent = "Haste potion: faster for 7 seconds";
  } else {
    return;
  }
  player.itemUses--;
}

function collectPickups() {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const item = pickups[i];
    for (const fighter of fighters) {
      if (!fighter.alive || Math.hypot(fighter.x - item.x, fighter.y - item.y) > 27) continue;
      if (item.type === "health") {
        fighter.health = Math.min(fighter.maxHealth, fighter.health + 30);
      } else if (item.type === "ammo") {
        const ammoBoost = weapons[fighter.weaponName].ammo * 2;
        fighter.reserve += ammoBoost;
        fighter.ammo = Math.min(weapons[fighter.weaponName].ammo, fighter.ammo + Math.ceil(ammoBoost / 3));
      } else if (item.type === "relic") {
        fighter.health = Math.min(fighter.maxHealth, fighter.health + 18);
        fighter.damageMultiplier *= 1.08;
      } else if (item.type === "movement") {
        fighter.movementBoostMultiplier = 1.5;
        fighter.movementBoostUntil = elapsed + 10000;
        if (fighter.isPlayer) statusText.textContent = "Speed charm: faster for 10 seconds";
      } else if (item.type === "weapon" && item.weaponName !== fighter.weaponName) {
        equip(fighter, item.weaponName);
      } else {
        continue;
      }
      if (fighter.healOnPickup) {
        fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.healOnPickup);
      }
      const ammoBonus = fighter.curses.reduce((total, key) => total + (cursedGear[key].ammoOnPickup || 0), 0);
      fighter.reserve += ammoBonus;
      pickups.splice(i, 1);
      break;
    }
  }
}

function checkEnd() {
  if (selectedMode === "persistent") return;
  const livingTeams = new Set(fighters.filter((fighter) => fighter.alive).map((fighter) => fighter.team));
  if (!player.alive && (selectedMode === "solo" || !livingTeams.has(player.team))) {
    finishGame("You were eliminated. Try another loadout!");
    return;
  }
  if (livingTeams.size === 1) {
    finishGame(livingTeams.has(player.team)
      ? "Your team is the last one standing!"
      : "Your team was eliminated. Try another loadout!");
  }
}

function finishGame(message) {
  gameRunning = false;
  document.querySelector("#exit-match").hidden = true;
  gameOver.querySelector("p").textContent = message;
  gameOver.classList.remove("hidden");
}

function returnToLobby() {
  gameRunning = false;
  gamePaused = false;
  arenaScreen.style.display = "none";
  characterMenu.style.removeProperty("display");
  characterMenu.hidden = true;
  modeScreen.hidden = true;
  lobbyScreen.hidden = false;
  gameOver.classList.add("hidden");
  upgradePanel.classList.add("hidden");
  document.querySelector("#level-up-panel").classList.add("hidden");
  document.querySelector("#weapon-wheel").hidden = true;
  document.querySelector("#exit-match").hidden = true;
  weaponWheelOpen = false;
  cursedChoicePending = false;
  progressionPending = false;
  keys.clear();
  mouse.down = false;
  mouse.rightDown = false;
  scopeFocus = 0;
  scopeTarget = null;
}

function update(dt) {
  elapsed += dt * 1000;
  updateScopeFocus(dt);
  if (selectedMode === "persistent") {
    persistentSpawnTimer -= dt;
    if (persistentSpawnTimer <= 0 &&
      fighters.filter((fighter) => fighter.alive).length < MATCH_FIGHTER_LIMIT) {
      spawnBot();
      persistentSpawnTimer = 5 + Math.random() * 3;
    }
  }
  for (const fighter of fighters) {
    if (!fighter.alive) {
      if (fighter.isPlayer && fighter.respawnTimer > 0) {
        fighter.respawnTimer -= dt;
        if (fighter.respawnTimer <= 0) respawnPlayer();
      }
      continue;
    }
    moveFighter(fighter, dt);
    if (selectedMode !== "persistent" &&
      Math.hypot(fighter.x - WORLD.width / 2, fighter.y - WORLD.height / 2) > getStormRadius()) {
      damage(fighter, STORM.damagePerSecond * dt, null);
    }
    if (fighter.alive && fighter.regeneration > 0) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.regeneration * dt);
    }
  }
  updateBullets(dt);
  collectPickups();
  particles.forEach((particle) => { particle.life -= dt * 1000; });
  particles = particles.filter((particle) => particle.life > 0);
  smokeClouds.forEach((cloud) => { cloud.life -= dt * 1000; });
  smokeClouds = smokeClouds.filter((cloud) => cloud.life > 0);
  updateCamera();
  if (selectedMode === "persistent") return;
  checkEnd();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const zoom = getCameraZoom();
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-camera.x, -camera.y);
  ctx.fillStyle = "#18241c";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.strokeStyle = "rgba(167, 193, 128, .09)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke(); }
  for (let y = 0; y <= WORLD.height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke(); }
  if (selectedMode !== "persistent") drawStorm();
  drawBuildings();
  if (spawnMode === "pillars") {
    pillars.forEach((pillar) => {
      ctx.fillStyle = "#55436b";
      ctx.beginPath(); ctx.ellipse(pillar.x, pillar.y, 95, 70, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#b58ce8"; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = "rgba(220,190,255,.18)"; ctx.fillRect(pillar.x - 75, pillar.y - 48, 150, 96);
    });
  }
  ctx.strokeStyle = "#ff684f";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, WORLD.width, WORLD.height);
  pickups.forEach((item) => {
    if (canPlayerSee(item.x, item.y)) drawPickup(item);
  });
  bullets.forEach((bullet) => {
    if (!bullet.owner.isPlayer && !canPlayerSee(bullet.x, bullet.y)) return;
    ctx.fillStyle = bullet.color;
    ctx.beginPath(); ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); ctx.fill();
  });
  particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / 450) * 0.55;
    ctx.fillStyle = particle.color;
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius * (1.3 - particle.life / 1000), 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
  fighters.forEach((fighter) => {
    if (fighter.roofBuildingIndex < 0 &&
      (fighter.isPlayer || (fighter.alive && canPlayerSeeFighter(fighter)))) drawFighter(fighter);
  });
  smokeClouds.forEach((cloud) => {
    ctx.globalAlpha = Math.min(0.55, cloud.life / 5000 * 0.55);
    ctx.fillStyle = "#b8b8b0";
    ctx.beginPath(); ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
  drawBuildingRoofsAndWalls();
  fighters.forEach((fighter) => {
    if (fighter.roofBuildingIndex >= 0 &&
      (fighter.isPlayer || (fighter.alive && isAtRoofEdge(fighter) && canPlayerSeeFighter(fighter)))) {
      drawFighter(fighter);
    }
  });
  ctx.restore();
  if (isScoped()) drawScopeOverlay();
  drawHud();
  updateWheelHighlight();
}

function drawStorm() {
  const radius = getStormRadius();
  ctx.save();
  ctx.fillStyle = "rgba(98, 36, 112, .28)";
  ctx.beginPath();
  ctx.rect(0, 0, WORLD.width, WORLD.height);
  ctx.arc(WORLD.width / 2, WORLD.height / 2, radius, 0, Math.PI * 2);
  ctx.fill("evenodd");
  ctx.strokeStyle = "#d77aff";
  ctx.lineWidth = 12;
  ctx.shadowColor = "#b844ed";
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.arc(WORLD.width / 2, WORLD.height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawScopeOverlay() {
  ctx.save();
  const vignette = ctx.createRadialGradient(
    mouse.x, mouse.y, Math.min(canvas.width, canvas.height) * 0.28,
    mouse.x, mouse.y, Math.max(canvas.width, canvas.height) * 0.78
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, .74)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(238, 245, 220, .9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 13, 0, Math.PI * 2);
  ctx.moveTo(mouse.x - 24, mouse.y);
  ctx.lineTo(mouse.x - 5, mouse.y);
  ctx.moveTo(mouse.x + 5, mouse.y);
  ctx.lineTo(mouse.x + 24, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - 24);
  ctx.lineTo(mouse.x, mouse.y - 5);
  ctx.moveTo(mouse.x, mouse.y + 5);
  ctx.lineTo(mouse.x, mouse.y + 24);
  ctx.stroke();
  ctx.fillStyle = "#f4f3d9";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  const focusLabel = scopeTarget ? `TARGET FOCUS ${Math.round(scopeFocus * 100)}%` : "WIDE VIEW · steady on a target to focus";
  ctx.fillText(`SCOPE · ${focusLabel}`, 14, canvas.height - 16);
  ctx.restore();
}

function drawPickup(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  const palette = { health: "#68ed8c", ammo: "#7dc3ff", relic: "#ff8ed8", movement: "#ffe65c", weapon: "#ffd45c" };
  ctx.fillStyle = palette[item.type] || "#ffd45c";
  ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
  ctx.fillRect(-10, -10, 20, 20);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#222";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  const glyph = item.type === "health" ? "+" : item.type === "ammo" ? "A" : item.type === "relic" ? "R" : item.type === "movement" ? "»" : "✦";
  ctx.fillText(glyph, 0, 5);
  ctx.restore();
}

function drawFighter(fighter) {
  if (!fighter.alive) return;
  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  drawOutfitModel(fighter);
  ctx.rotate(fighter.angle || 0);
  drawWeaponModel(fighter.weaponName, weapons[fighter.weaponName].color);
  ctx.rotate(-(fighter.angle || 0));
  ctx.fillStyle = "#fb5b38";
  ctx.fillRect(-fighter.radius, -fighter.radius - 10, fighter.radius * 2, 4);
  ctx.fillStyle = "#74ed82";
  ctx.fillRect(-fighter.radius, -fighter.radius - 10, fighter.radius * 2 * fighter.health / fighter.maxHealth, 4);
  ctx.fillStyle = "#fff";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(fighter.isPlayer ? "YOU" : fighter.name, 0, -fighter.radius - 15);
  if (elapsed < fighter.spawnProtectedUntil) {
    ctx.strokeStyle = "#a9f5ff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, fighter.radius + 6, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawBuildings() {
  for (const building of buildings) {
    ctx.fillStyle = "#443f38";
    ctx.fillRect(building.x, building.y, building.w, building.h);
    ctx.fillStyle = building.color;
    ctx.fillRect(building.x + 18, building.y + 18, building.w - 36, building.h - 36);
    ctx.fillStyle = "rgba(240,211,162,.15)";
    ctx.fillRect(building.x + 28, building.y + 28, building.w - 56, 6);
    ctx.fillStyle = "#342c26";
    ctx.fillRect(building.x + building.w / 2 - 20, building.y + building.h - 40, 40, 22);
    ctx.fillStyle = "#c39a58";
    for (let wx = building.x + 36; wx < building.x + building.w - 30; wx += 80) {
      ctx.fillRect(wx, building.y + 35, 18, 24);
      ctx.fillRect(wx, building.y + building.h - 65, 18, 24);
    }
  }
}

function drawBuildingRoofsAndWalls() {
  const playerBuilding = player.roofBuildingIndex < 0
    ? buildings.find((building) =>
      player.x > building.x && player.x < building.x + building.w &&
      player.y > building.y && player.y < building.y + building.h)
    : null;
  for (const building of buildings) {
    if (building === playerBuilding) continue;
    ctx.fillStyle = building.color;
    ctx.fillRect(building.x, building.y, building.w, building.h);
    ctx.fillStyle = "#a84f39";
    ctx.beginPath();
    ctx.moveTo(building.x + 20, building.y + 28);
    ctx.lineTo(building.x + building.w / 2, building.y - 20);
    ctx.lineTo(building.x + building.w - 20, building.y + 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#252820";
    ctx.lineWidth = 5;
    ctx.strokeRect(building.x, building.y, building.w, building.h);
  }
  ctx.fillStyle = "#777064";
  for (const wall of obstacles) {
    ctx.fillStyle = buildingWalls.includes(wall) ? "#4e493e" : "#756b5a";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = buildingWalls.includes(wall) ? "#786d59" : "#a89a7d";
    ctx.fillRect(wall.x, wall.y, wall.w, Math.min(5, wall.h));
    ctx.strokeStyle = "#302e28";
    ctx.lineWidth = 3;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }
}

function drawOutfitModel(fighter) {
  const color = outfits[fighter.outfit].color;
  const outline = fighter.isPlayer ? "#fff5b4" : "#231c23";
  ctx.lineWidth = 2;
  ctx.strokeStyle = outline;
  ctx.fillStyle = color;
  if (fighter.outfit === "Ghost") {
    ctx.beginPath();
    ctx.moveTo(-14, 8); ctx.lineTo(-13, -7); ctx.quadraticCurveTo(-12, -20, 0, -20);
    ctx.quadraticCurveTo(13, -19, 14, -6); ctx.lineTo(14, 8);
    ctx.lineTo(8, 4); ctx.lineTo(2, 9); ctx.lineTo(-4, 4); ctx.lineTo(-10, 9); ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (fighter.outfit === "Pumpkin") {
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#c75d14";
    for (const x of [-8, 0, 8]) { ctx.beginPath(); ctx.ellipse(x, 0, 4, 14, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = "#557c39"; ctx.fillRect(-3, -19, 6, 6);
  } else if (fighter.outfit === "Skeleton") {
    ctx.fillStyle = "#292828"; ctx.beginPath(); ctx.ellipse(0, 0, 15, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e7e2cf"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(8, -9); ctx.moveTo(-10, -2); ctx.lineTo(10, -2); ctx.moveTo(-9, 5); ctx.lineTo(9, 5); ctx.stroke();
    ctx.fillStyle = "#eee7d4"; ctx.beginPath(); ctx.arc(0, -16, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#231c23"; ctx.beginPath(); ctx.arc(-3, -16, 2, 0, Math.PI * 2); ctx.arc(3, -16, 2, 0, Math.PI * 2); ctx.fill();
  } else if (fighter.outfit === "Werewolf") {
    ctx.beginPath(); ctx.ellipse(0, 1, 15, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-16, -25); ctx.lineTo(-5, -17); ctx.moveTo(12, -12); ctx.lineTo(16, -25); ctx.lineTo(5, -17); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e8d2a6"; ctx.beginPath(); ctx.arc(-5, -3, 2, 0, Math.PI * 2); ctx.arc(5, -3, 2, 0, Math.PI * 2); ctx.fill();
  } else if (fighter.outfit === "Witch") {
    ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(-11, -9); ctx.lineTo(11, -9); ctx.lineTo(16, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#32213d"; ctx.beginPath(); ctx.arc(0, -13, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -17); ctx.lineTo(4, -39); ctx.lineTo(11, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#edcf83"; ctx.fillRect(-4, -17, 8, 3);
  } else {
    ctx.fillStyle = "#4b1529"; ctx.beginPath(); ctx.moveTo(-18, 12); ctx.lineTo(-13, -10); ctx.lineTo(0, -20); ctx.lineTo(13, -10); ctx.lineTo(18, 12); ctx.lineTo(7, 6); ctx.lineTo(0, 13); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, -13, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f3d9b8"; ctx.beginPath(); ctx.arc(-3, -14, 1.5, 0, Math.PI * 2); ctx.arc(3, -14, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#201923";
  if (fighter.outfit !== "Skeleton" && fighter.outfit !== "Werewolf" && fighter.outfit !== "Witch" && fighter.outfit !== "Vampire") {
    ctx.beginPath(); ctx.arc(-5, -4, 2, 0, Math.PI * 2); ctx.arc(5, -4, 2, 0, Math.PI * 2); ctx.fill();
  }
  if (fighter.accessory === "Bat companion") {
    ctx.fillStyle = "#252036";
    ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(-25, -24); ctx.lineTo(-23, -15); ctx.lineTo(-29, -12); ctx.lineTo(-18, -11); ctx.closePath(); ctx.fill();
  } else if (fighter.accessory === "Floating lantern") {
    ctx.fillStyle = "#ffcf63"; ctx.beginPath(); ctx.arc(-20, -23, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ddb34e"; ctx.beginPath(); ctx.moveTo(-20, -18); ctx.lineTo(-15, -12); ctx.stroke();
  } else if (fighter.accessory === "Graveyard chains") {
    ctx.strokeStyle = "#b5b4a1"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.fillStyle = fighter.team === player.team ? "#58d2ad" : "#ed6b58";
  ctx.fillRect(-7, 15, 14, 3);
}

function drawWeaponModel(weaponName, color) {
  ctx.save();
  ctx.translate(9, 0);
  ctx.fillStyle = "#2c2521";
  ctx.strokeStyle = "#151311";
  ctx.lineWidth = 2;
  if (weaponName === "Pumpkin Launcher") {
    ctx.fillRect(-2, -5, 25, 10); ctx.fillStyle = "#ff8a2c"; ctx.beginPath(); ctx.arc(26, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5c4428"; ctx.fillRect(2, 4, 6, 8);
  } else if (weaponName.includes("Shotgun")) {
    ctx.fillRect(0, -6, 28, 12); ctx.fillStyle = "#8c583b"; ctx.fillRect(-6, -4, 9, 8); ctx.fillStyle = color; ctx.fillRect(17, -4, 14, 3);
  } else if (weaponName === "Spider Minigun") {
    ctx.fillRect(0, -8, 26, 16); ctx.fillStyle = color;
    for (let y = -6; y <= 6; y += 4) { ctx.fillRect(22, y, 13, 2); }
    ctx.fillStyle = "#242020"; ctx.fillRect(4, 7, 6, 6);
  } else if (weaponName === "Werewolf SMG") {
    ctx.fillRect(0, -5, 23, 10); ctx.fillStyle = "#b83c58"; ctx.fillRect(5, 5, 5, 9); ctx.fillStyle = color; ctx.fillRect(20, -3, 9, 3);
  } else if (weaponName === "Skeleton AR") {
    ctx.fillRect(0, -5, 28, 10); ctx.fillStyle = "#e8e3d3"; ctx.fillRect(14, -8, 7, 3); ctx.fillStyle = "#514a42"; ctx.fillRect(7, 5, 4, 8);
  } else {
    ctx.fillRect(0, -4, 19, 8); ctx.fillStyle = color; ctx.fillRect(15, -3, 12, 3); ctx.fillStyle = "#554234"; ctx.fillRect(4, 4, 5, 7);
  }
  ctx.restore();
}

function drawHud() {
  if (!player) return;
  const alive = fighters.filter((fighter) => fighter.alive).length;
  document.querySelector("#health").textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
  document.querySelector("#weapon-info").textContent = `${player.weaponName}  |  ${player.reloading ? "RELOADING" : `${player.ammo} / ${player.reserve}`}`;
  document.querySelector("#alive").textContent = `${alive} fighter${alive === 1 ? "" : "s"} alive`;
  document.querySelector("#kills").textContent = `${player.kills} ${player.kills === 1 ? "elimination" : "eliminations"}`;
  document.querySelector("#match-time").textContent = `${Math.floor(elapsed / 60000)}:${String(Math.floor(elapsed / 1000) % 60).padStart(2, "0")}`;
  document.querySelector("#cursed-count").textContent = `Curses ${player.curses.length} / 3`;
  document.querySelector("#weapon-hud").textContent = `Weapons ${player.ownedWeapons.length} · hold Tab to switch`;
  document.querySelector("#roof-hud").textContent = player.roofBuildingIndex >= 0
    ? `Rooftop · ${Math.round(ROOF_MOVE_MULTIPLIER * 100)}% speed · edge-only shots/damage · press E to climb down`
    : "Ground · press E near a building to climb";
  document.querySelector("#item-hud").textContent = player.itemUses > 0
    ? `Item: ${startingItem} ×${player.itemUses} · press 1`
    : "Item: none";
  const stormHud = document.querySelector("#storm-hud");
  if (selectedMode === "persistent") {
    stormHud.textContent = "Storm: disabled in Persistent";
  } else if (elapsed < STORM.delay) {
    const seconds = Math.ceil((STORM.delay - elapsed) / 1000);
    stormHud.textContent = `Storm forms in ${seconds}s`;
  } else {
    const seconds = Math.ceil(Math.max(0, STORM.delay + STORM.duration - elapsed) / 1000);
    const outside = Math.hypot(player.x - WORLD.width / 2, player.y - WORLD.height / 2) > getStormRadius();
    stormHud.textContent = `${outside ? "OUTSIDE STORM · " : ""}Storm closes ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }
  updateProgressHud();
}

function loop(now) {
  if (!gameRunning) return;
  if (!lastFrame) lastFrame = now;
  const dt = Math.min((now - lastFrame) / 1000, 0.04);
  lastFrame = now;
  if (!gamePaused) update(dt);
  draw();
  if (gameRunning) requestAnimationFrame(loop);
}

function setCanvasSize() {
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.round(bounds.width);
  canvas.height = Math.round(bounds.height);
  updateCamera();
}

const lobbyScreen = document.querySelector("#lobby-screen");
const modeScreen = document.querySelector("#mode-screen");
document.querySelector("#lobby-continue").addEventListener("click", () => {
  lobbyScreen.hidden = true;
  modeScreen.hidden = false;
});
document.querySelector("#mode-back").addEventListener("click", () => {
  modeScreen.hidden = true;
  lobbyScreen.hidden = false;
});
document.querySelector("#mode-continue").addEventListener("click", () => {
  modeScreen.hidden = true;
  characterMenu.style.removeProperty("display");
  characterMenu.hidden = false;
});
document.querySelector("#character-back").addEventListener("click", () => {
  characterMenu.hidden = true;
  modeScreen.hidden = false;
});
document.querySelector("#start-button").addEventListener("click", startGame);
document.querySelector("#host-online").addEventListener("click", createOnlineRoom);
document.querySelector("#join-online").addEventListener("click", joinOnlineRoom);
document.querySelector("#start-online-match").addEventListener("click", startOnlineMatch);
document.querySelector("#leave-online-room").addEventListener("click", leaveOnlineRoom);
weaponSelect.addEventListener("change", updateWeaponDescription);
document.querySelector("#again-button").addEventListener("click", returnToLobby);
document.querySelector("#exit-match").addEventListener("click", returnToLobby);
document.querySelectorAll("[data-upgrade]").forEach((button) => {
  button.addEventListener("click", () => chooseUpgrade(button.dataset.upgrade));
});
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "e" && gameRunning && !event.repeat) {
    togglePlayerRoof();
    return;
  }
  if (event.key === "Tab" && gameRunning) {
    event.preventDefault();
    if (!gamePaused && !weaponWheelOpen && player.ownedWeapons.length) {
      weaponWheelOpen = true;
      gamePaused = true;
      selectedWheelIndex = Math.max(0, wheelWeaponNames.indexOf(player.weaponName));
      document.querySelector("#weapon-wheel").hidden = false;
      updateWheelHighlight();
    }
    return;
  }
  keys.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === "r" && player) reload(player);
  if (event.key === "1") useStartingItem();
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
  if (event.key === "Tab" && weaponWheelOpen) selectWheelWeapon(selectedWheelIndex);
});
canvas.addEventListener("mousemove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  mouse.x = event.clientX - bounds.left;
  mouse.y = event.clientY - bounds.top;
  updateWheelHighlight();
});
canvas.addEventListener("mousedown", (event) => {
  if (event.button === 0) mouse.down = true;
  if (event.button === 2) mouse.rightDown = true;
});
window.addEventListener("mouseup", (event) => {
  if (event.button === 0) mouse.down = false;
  if (event.button === 2) mouse.rightDown = false;
});
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("resize", setCanvasSize);
updateWeaponDescription();
setCanvasSize();
