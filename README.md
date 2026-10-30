# Online lobby server

The game files are static and can be hosted on GitHub Pages. Online rooms need
this separate Node.js service.

## Deploy to Render

1. Push the game folder to a GitHub repository.
2. In Render, create a **Web Service** connected to that repository.
3. Set **Root Directory** to `server`
   (or the path to this directory relative to the repository root).
4. Choose **Node** as the runtime. Set the build command to `npm install` and
   the start command to `npm start`. There are no external dependencies.
5. Deploy and confirm that the service's `/health` endpoint returns JSON with
   `"ok": true`.
6. Publish `halloweengame.html` and `halloweengame.js` with GitHub Pages. In the
   game's **Online Multiplayer** panel, enter the Render service URL (without
   `/health`) and create or join a room.

For local testing, run `npm start` from the `server/` directory and enter
`http://localhost:3000` as the server URL.

## Current limits

Rooms and player state are held in memory and disappear when the service
restarts or sleeps. Each browser currently simulates its own bots and arena;
online players' positions and player-to-player damage are synchronized, but
bot behavior and bot combat are not authoritative or shared between clients.
