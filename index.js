const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = req.url;
  console.log(`${new Date().toISOString()} - ${req.method} ${url}`);

  if (url === "/api/v1/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html>
<head><title>WebSocket Test</title></head>
<body>
  <h2>Railway WebSocket Test</h2>
  <div id="status">Connecting...</div>
  <div id="messages"></div>
  <script>
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(proto + "//" + location.host + "/ws/test/abc123");
    const status = document.getElementById("status");
    const messages = document.getElementById("messages");

    ws.onopen = () => {
      status.textContent = "Connected!";
      ws.send("hello from browser");
    };
    ws.onmessage = (e) => {
      messages.innerHTML += "<p>Server: " + e.data + "</p>";
    };
    ws.onerror = (e) => {
      status.textContent = "Error: " + e.type;
    };
    ws.onclose = (e) => {
      status.textContent = "Closed (code: " + e.code + ", reason: " + e.reason + ")";
    };
  </script>
</body>
</html>`);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

// WebSocket server — handle upgrade manually on paths matching /ws/*
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = req.url;
  console.log(`${new Date().toISOString()} - UPGRADE ${url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);

  if (url && url.startsWith("/ws/")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    console.log(`Rejecting upgrade for path: ${url}`);
    socket.destroy();
  }
});

wss.on("connection", (ws, req) => {
  const url = req.url;
  console.log(`WebSocket connected: ${url}`);

  ws.send(JSON.stringify({ event: "connected", path: url, timestamp: new Date().toISOString() }));

  ws.on("message", (data) => {
    const msg = data.toString();
    console.log(`WebSocket message from ${url}: ${msg}`);
    ws.send(JSON.stringify({ event: "echo", data: msg, timestamp: new Date().toISOString() }));
  });

  ws.on("close", () => {
    console.log(`WebSocket disconnected: ${url}`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  console.log(`HTTP: http://0.0.0.0:${PORT}`);
  console.log(`WebSocket: ws://0.0.0.0:${PORT}/ws/test/{id}`);
});
