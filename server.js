// ─── structAcademy production server ─────────────────────────────────────────
// Serves the Vite build from dist/ and proxies /api/interpret to Anthropic.
// Usage:
//   npm run build
//   node server.js
//
// Requires ANTHROPIC_API_KEY in .env (or as an environment variable).

import express from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no extra dependency — just read the file)
try {
  const env = readFileSync(join(__dirname, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !key.startsWith("#")) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  // .env not found — rely on environment variables already set in the shell
}

const app = express();
app.use(express.json());

// ── Anthropic proxy ───────────────────────────────────────────────────────────
app.post("/api/interpret", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Proxy error", detail: err.message });
  }
});

// ── Serve Vite build ──────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));

// SPA fallback — all unmatched routes serve index.html
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`structAcademy running at http://localhost:${PORT}`);
});
