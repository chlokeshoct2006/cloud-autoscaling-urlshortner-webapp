const express = require("express");
const os = require("os");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const urlStore = {};

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("UP");
});

// Shorten URL endpoint
app.post("/shorten", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const code = crypto.randomBytes(3).toString("hex");
  urlStore[code] = { url, clicks: 0, createdAt: new Date().toISOString() };

  res.json({
    shortUrl: /,
    fullShortUrl: ${req.protocol}:///,
    code: code,
    pod: os.hostname()
  });
});

// Redirect endpoint
app.get("/:code", (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).send("Not found");

  entry.clicks++;
  res.redirect(entry.url);
});

// Stats endpoint
app.get("/stats/all", (req, res) => {
  res.json({
    pod: os.hostname(),
    totalUrls: Object.keys(urlStore).length,
    urls: urlStore
  });
});

app.listen(PORT, () => {
  console.log(Server running on port  (pod: ));
});
