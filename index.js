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
    
    // 1. Browser Launch Karo
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote"
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });

    const page = await browser.newPage();
    
    // User-Agent set karo taaki real lage
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 2. Page pe jao aur wait karo
    await page.goto(`https://downloader.k0mraidhost.name.ng/download/youtube/video?url=${encodeURIComponent(url)}`, {
      waitUntil: 'networkidle2', // Wait jab tak loading band na ho jaye
      timeout: 60000 // 60 sec timeout
    });

    // 3. Body ka text (JSON) uthao
    // Cloudflare check ke baad jo asli JSON bachega, wo ye utha lega
    const content = await page.evaluate(() => document.body.innerText);

    try {
      const json = JSON.parse(content);
      res.json(json);
    } catch (e) {
      // Agar JSON parse nahi hua, matlab abhi bhi Cloudflare page pe hai
      res.status(500).json({ error: "Cloudflare not bypassed", body: content.substring(0, 200) });
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
