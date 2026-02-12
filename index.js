const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  console.log(`${new Date().toISOString()} - ${method} ${url}`);

  if (url === "/api/v1/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      service: "railway-healthcheck-test",
      healthcheck: "/api/v1/health",
      uptime: process.uptime(),
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
