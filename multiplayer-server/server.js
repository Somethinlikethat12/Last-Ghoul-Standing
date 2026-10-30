const http = require("node:http");
const { randomInt, randomUUID } = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const MAX_PLAYERS = 100;
const PLAYER_TIMEOUT_MS = 30000;
const ROOM_TIMEOUT_MS = 120000;
const rooms = new Map();
const codeAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function send(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16384) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function makeRoomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function cleanName(value) {
  return String(value || "Player").trim().replace(/[<>]/g, "").slice(0, 20) || "Player";
}

function publicRoom(room) {
  const players = Array.from(room.players.values()).map((player, index) => ({
    id: player.id,
    name: player.name,
    host: player.id === room.hostId,
    team: room.mode === "teams" ? 1 : index + 1,
    state: player.state,
    damageEvents: player.damageEvents
  }));
  return {
    code: room.code,
    hostId: room.hostId,
    started: room.started,
    mode: room.mode,
    seed: room.seed,
    players
  };
}

function getRoomPlayer(room, playerId) {
  if (!room || typeof playerId !== "string") return null;
  return room.players.get(playerId) || null;
}

async function handle(request, response) {
  const url = new URL(request.url, "http://localhost");
  if (request.method === "OPTIONS") {
    send(response, 204, {});
    return;
  }
  if (request.method === "GET" && url.pathname === "/health") {
    send(response, 200, { ok: true, service: "last-ghoul-standing-lobby" });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/rooms") {
    const body = await readBody(request);
    const code = makeRoomCode();
    const hostId = randomUUID();
    const room = {
      code,
      hostId,
      mode: ["solo", "teams", "persistent"].includes(body.mode) ? body.mode : "solo",
      started: false,
      seed: randomInt(1, 2147483647),
      updatedAt: Date.now(),
      players: new Map()
    };
    room.players.set(hostId, {
      id: hostId, name: cleanName(body.name), state: null, damageEvents: [], lastSeenAt: Date.now()
    });
    rooms.set(code, room);
    send(response, 201, { room: publicRoom(room), playerId: hostId });
    return;
  }

  const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/join$/);
  if (request.method === "POST" && joinMatch) {
    const code = joinMatch[1];
    const room = rooms.get(code);
    if (!room) {
      send(response, 404, { error: "Room not found. Check the code and try again." });
      return;
    }
    if (room.started) {
      send(response, 409, { error: "That match has already started." });
      return;
    }
    if (room.players.size >= MAX_PLAYERS) {
      send(response, 409, { error: "That lobby is full." });
      return;
    }
    const body = await readBody(request);
    const playerId = randomUUID();
    room.players.set(playerId, {
      id: playerId, name: cleanName(body.name), state: null, damageEvents: [], lastSeenAt: Date.now()
    });
    room.updatedAt = Date.now();
    send(response, 201, { room: publicRoom(room), playerId });
    return;
  }

  const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)$/);
  if (request.method === "GET" && roomMatch) {
    const room = rooms.get(roomMatch[1]);
    const player = getRoomPlayer(room, url.searchParams.get("playerId"));
    if (!room || !player) {
      send(response, 404, { error: "Room or player session not found." });
      return;
    }
    player.lastSeenAt = Date.now();
    room.updatedAt = Date.now();
    const snapshot = publicRoom(room);
    const ownSnapshot = snapshot.players.find((entry) => entry.id === player.id);
    ownSnapshot.damageEvents = player.damageEvents.splice(0);
    send(response, 200, { room: snapshot, playerId: player.id });
    return;
  }

  const startMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/start$/);
  if (request.method === "POST" && startMatch) {
    const room = rooms.get(startMatch[1]);
    const body = await readBody(request);
    const player = getRoomPlayer(room, body.playerId);
    if (!room || !player) {
      send(response, 404, { error: "Room or player session not found." });
      return;
    }
    if (player.id !== room.hostId) {
      send(response, 403, { error: "Only the lobby host can start the match." });
      return;
    }
    room.mode = ["solo", "teams", "persistent"].includes(body.mode) ? body.mode : room.mode;
    room.started = true;
    room.updatedAt = Date.now();
    send(response, 200, { room: publicRoom(room) });
    return;
  }

  const playerUpdate = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/players\/([a-f0-9-]+)$/i);
  if (request.method === "POST" && playerUpdate) {
    const room = rooms.get(playerUpdate[1]);
    const player = getRoomPlayer(room, playerUpdate[2]);
    if (!room || !player) {
      send(response, 404, { error: "Room or player session not found." });
      return;
    }
    player.state = await readBody(request);
    player.lastSeenAt = Date.now();
    room.updatedAt = Date.now();
    const snapshot = publicRoom(room);
    const ownSnapshot = snapshot.players.find((entry) => entry.id === player.id);
    ownSnapshot.damageEvents = player.damageEvents.splice(0);
    send(response, 200, { room: snapshot, playerId: player.id });
    return;
  }

  const damageEvent = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/damage$/);
  if (request.method === "POST" && damageEvent) {
    const room = rooms.get(damageEvent[1]);
    const body = await readBody(request);
    const attacker = getRoomPlayer(room, body.attackerId);
    const victim = getRoomPlayer(room, body.victimId);
    const amount = Number(body.amount);
    if (!room || !attacker || !victim || !Number.isFinite(amount) || amount <= 0 || amount > 200) {
      send(response, 400, { error: "Invalid multiplayer damage event." });
      return;
    }
    if (!room.started) {
      send(response, 409, { error: "The match has not started yet." });
      return;
    }
    victim.damageEvents.push({ amount, attackerId: attacker.id });
    room.updatedAt = Date.now();
    send(response, 202, { ok: true });
    return;
  }

  const leaveMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/leave$/);
  if (request.method === "POST" && leaveMatch) {
    const room = rooms.get(leaveMatch[1]);
    const body = await readBody(request);
    const player = getRoomPlayer(room, body.playerId);
    if (!room || !player) {
      send(response, 404, { error: "Room or player session not found." });
      return;
    }
    room.players.delete(player.id);
    if (room.players.size === 0) {
      rooms.delete(room.code);
    } else {
      if (player.id === room.hostId) room.hostId = room.players.keys().next().value;
      room.updatedAt = Date.now();
    }
    send(response, 200, { ok: true });
    return;
  }

  send(response, 404, { error: "Route not found." });
}

const server = http.createServer((request, response) => {
  handle(request, response).catch((error) => {
    if (!response.headersSent) send(response, 400, { error: error.message });
    else response.destroy(error);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Last Ghoul Standing lobby server listening on ${PORT}`);
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    for (const [playerId, player] of room.players) {
      if (now - player.lastSeenAt > PLAYER_TIMEOUT_MS) {
        room.players.delete(playerId);
        if (room.hostId === playerId && room.players.size) room.hostId = room.players.keys().next().value;
      }
    }
    if (room.players.size === 0 || now - room.updatedAt > ROOM_TIMEOUT_MS) rooms.delete(code);
  }
}, 10000).unref();
