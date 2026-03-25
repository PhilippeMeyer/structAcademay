import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function anthropicProxy(env) {
  return {
    name: "anthropic-proxy",
    configureServer(server) {
      server.middlewares.use("/api/interpret", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        // loadEnv makes the key available here without needing dotenv directly
        const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "ANTHROPIC_API_KEY not set in .env" }));
          return;
        }

        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", async () => {
          try {
            const upstream = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type":      "application/json",
                "x-api-key":         apiKey,
                "anthropic-version": "2023-06-01",
              },
              body,
            });
            const data = await upstream.json();
            res.statusCode = upstream.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Proxy error", detail: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // loadEnv reads .env, .env.local, .env.[mode] from the project root.
  // Third argument "" means: load ALL vars (not just VITE_ prefixed ones).
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), anthropicProxy(env)],
    server: {
      port: 3000,
      open: true,
    },
  };
});
