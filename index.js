const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => res.send("🔥 Puppeteer Bridge Active!"));

app.get("/solve", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL missing" });

  let browser;
  try {
    console.log(`[BROWSER] Opening: ${url}`);
    
    // Launch Browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", 
        "--disable-gpu"
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });

    const page = await browser.newPage();
    
    // Fake User-Agent (Important)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Go to URL and wait for Cloudflare check
    await page.goto(`https://downloader.k0mraidhost.name.ng/download/youtube/video?url=${encodeURIComponent(url)}`, {
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    // Get JSON content
    const content = await page.evaluate(() => document.body.innerText);

    try {
      const json = JSON.parse(content);
      res.json(json);
    } catch (e) {
      res.status(500).json({ error: "Not a JSON response", preview: content.substring(0, 100) });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
