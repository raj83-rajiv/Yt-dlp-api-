const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const axios = require("axios"); // Axios add kiya
const app = express();

app.use(cors());

// --- ROOT ---
app.get("/", (req, res) => {
  res.send({ status: "Online", message: "🔥 Koyeb Proxy & Downloader is Running!" });
});

// --- 1. K0MRAID METADATA PROXY (JSON Relay) ---
app.get("/k0mraid-meta", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "URL missing" });

  try {
    // Koyeb (Clean IP) calls k0mraidhost
    console.log(`[PROXY-META] Fetching: ${url}`);
    const { data } = await axios.get(`https://downloader.k0mraidhost.name.ng/download/youtube/video?url=${encodeURIComponent(url)}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://google.com'
      }
    });
    res.json(data); // Send clean JSON back to Bot
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.response?.data });
  }
});

// --- 2. K0MRAID VIDEO STREAM PROXY (Stream Relay) ---
app.get("/k0mraid-stream", async (req, res) => {
  const link = req.query.link; // Actual download link from k0mraid
  if (!link) return res.status(400).send("Link missing");

  try {
    console.log(`[PROXY-STREAM] Piping video...`);
    const response = await axios({
      url: link,
      method: 'GET',
      responseType: 'stream',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Headers copy karo taaki WhatsApp ko pata chale ye video hai
    res.header("Content-Type", response.headers['content-type']);
    res.header("Content-Length", response.headers['content-length']);
    res.header("Content-Disposition", `attachment; filename="video.mp4"`);

    // Pipe: k0mraid -> Koyeb -> Bot
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send("Stream Error");
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
