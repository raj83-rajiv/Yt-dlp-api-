const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => res.send("🔥 Puppeteer Bridge is Ready!"));

app.get("/solve", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL missing" });

  let browser;
  try {
    console.log(`[BROWSER] Opening: ${url}`);
    
    // Browser Launch (Minimal settings ke saath)
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
    
    // Real User-Agent (Cloudflare ko dhoka dene ke liye)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Link pe jao aur Cloudflare challenge solve hone ka wait karo
    await page.goto(`https://downloader.k0mraidhost.name.ng/download/youtube/video?url=${encodeURIComponent(url)}`, {
      waitUntil: 'networkidle2', // Wait jab tak page load band na ho
      timeout: 60000 // 60 seconds timeout
    });

    // Page ka text (JSON) nikalo
    const content = await page.evaluate(() => document.body.innerText);

    try {
      const json = JSON.parse(content);
      // Agar success: true hai to return karo
      if (json.success || json.result) {
        res.json(json);
      } else {
         // Agar JSON hai par error hai
         res.status(500).json({ error: "API returned error", data: json });
      }
    } catch (e) {
      // Agar JSON nahi hai (matlab abhi bhi HTML page hai)
      res.status(500).json({ error: "Cloudflare not bypassed", content_preview: content.substring(0, 100) });
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
