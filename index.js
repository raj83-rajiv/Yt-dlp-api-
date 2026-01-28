const express = require("express");
const cors = require("cors");

// Stealth Plugins import karo
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

app.get("/", (req, res) => res.status(200).send("🥷 Stealth Bridge Ready!"));

app.get("/solve", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL missing" });

  let browser;
  try {
    console.log(`[STEALTH] Opening: ${url}`);
    
    // Launch with RAM Saving Flags
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Memory leak roko
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", 
        "--disable-gpu",
        "--disable-extensions"
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });

    const page = await browser.newPage();

    // 🔥 RAM SAVER: Images aur Fonts load mat karo
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if(['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())){
          req.abort();
      } else {
          req.continue();
      }
    });
    
    // Real Browser User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Go to URL
    await page.goto(`https://downloader.k0mraidhost.name.ng/download/youtube/video?url=${encodeURIComponent(url)}`, {
      waitUntil: 'domcontentloaded', // NetworkIdle heavy hota hai, ye fast hai
      timeout: 45000 
    });

    // Thoda wait karo JS run hone ke liye
    await new Promise(r => setTimeout(r, 3000));

    // Content nikalo
    const content = await page.evaluate(() => document.body.innerText);

    try {
      const json = JSON.parse(content);
      res.json(json);
    } catch (e) {
      console.log("Parsing Failed. Content preview:", content.substring(0, 100));
      // 500 Error mat do, balki batao kya dikh raha hai
      res.status(200).json({ 
        success: false, 
        error: "Not JSON", 
        preview: content.substring(0, 200) // Cloudflare ka message dikhega
      });
    }

  } catch (err) {
    console.error("Browser Crash:", err.message);
    res.status(500).json({ error: "Server Crashed (RAM issue)", details: err.message });
  } finally {
    if (browser) {
        // Browser band karna zaroori hai
        try { await browser.close(); } catch(e) {}
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
