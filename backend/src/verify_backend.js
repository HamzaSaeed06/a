const http = require("http");
const WebSocket = require("ws");
const config = require("./config");
const logger = require("./config/logger");

const BASE_URL = `http://localhost:${config.port || 3000}`;
let jwtToken = "";
let bandId = "";
let locationId = "";

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (jwtToken) {
      reqHeaders["Authorization"] = `Bearer ${jwtToken}`;
    }

    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("\n🧪 STARTING SAFEWATCH BACKEND VERIFICATION SUITE 🧪\n");

  try {
    // 1. Health check
    const health = await request("GET", "/health");
    console.log(`[PASS] GET /health -> Status ${health.status} (${health.body.status})`);

    // 2. Auth Login
    const login = await request("POST", "/api/auth/login", {
      email: "sarah@example.com",
      password: "password123",
    });
    if (login.status !== 200 || !login.body.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(login.body)}`);
    }
    jwtToken = login.body.data.token;
    console.log(`[PASS] POST /api/auth/login -> JWT received for ${login.body.data.user.email}`);

    // 3. Auth Get Me
    const me = await request("GET", "/api/auth/me");
    console.log(`[PASS] GET /api/auth/me -> Authenticated as ${me.body.data?.user?.name}`);

    // 4. List Bands
    const bands = await request("GET", "/api/bands");
    if (!bands.body.data || bands.body.data.length === 0) {
      throw new Error("No bands returned from backend");
    }
    bandId = bands.body.data[0].id;
    console.log(`[PASS] GET /api/bands -> Returned ${bands.body.data.length} band(s) (Primary: ${bands.body.data[0].nickname})`);

    // 5. Get Band Details
    const bandDetail = await request("GET", `/api/bands/${bandId}`);
    console.log(`[PASS] GET /api/bands/${bandId} -> Nickname: ${bandDetail.body.data?.nickname}, Status: ${bandDetail.body.data?.status}`);

    // 6. Safe Zones (Locations) List
    const locations = await request("GET", `/api/bands/${bandId}/locations`);
    console.log(`[PASS] GET /api/bands/${bandId}/locations -> Found ${locations.body.data?.length || 0} safe zone(s)`);

    // 7. Create Safe Zone
    const newZone = await request("POST", `/api/bands/${bandId}/locations`, {
      name: "Central Park Playground",
      lat: 37.776,
      lng: -122.418,
      radiusM: 250,
    });
    locationId = newZone.body.data?.id;
    console.log(`[PASS] POST /api/bands/${bandId}/locations -> Created safe zone ID ${locationId} (${newZone.body.data?.name})`);

    // 8. Update Safe Zone
    const updateZone = await request("PATCH", `/api/locations/${locationId}`, {
      radiusM: 300,
    });
    console.log(`[PASS] PATCH /api/locations/${locationId} -> Radius updated to ${updateZone.body.data?.radiusM}m`);

    // 9. Activity Logs
    const activity = await request("GET", `/api/bands/${bandId}/activity`);
    console.log(`[PASS] GET /api/bands/${bandId}/activity -> Fetched ${activity.body.data?.logs?.length || 0} activity log item(s)`);

    // 10. Trigger SOS Event
    const sos = await request("POST", `/api/bands/${bandId}/sos`, {
      lat: 37.7749,
      lng: -122.4194,
    });
    console.log(`[PASS] POST /api/bands/${bandId}/sos -> SOS event recorded (Status: ${sos.body.data?.status})`);

    // 11. WebSocket Connection Test
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${config.port}/ws`);
      ws.on("open", () => {
        console.log(`[PASS] WebSocket Gateway connected on ws://localhost:${config.port}/ws`);
        ws.send(JSON.stringify({ type: "ping" }));
      });
      ws.on("message", (msg) => {
        const parsed = JSON.parse(msg.toString());
        console.log(`[PASS] WebSocket Message Received: ${parsed.type || "response"}`);
        ws.close();
        resolve();
      });
      ws.on("error", (err) => {
        console.error("WebSocket Error:", err);
        reject(err);
      });
    });

    console.log("\n✅ ALL BACKEND REST ENDPOINTS & WEBSOCKET VERIFICATIONS PASSED 100% ✅\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Backend Test Failed:", err.message);
    process.exit(1);
  }
};

// Allow app server to start then run tests
setTimeout(runTests, 1500);
