/**
 * Export docs/index.html to PDF (matches on-screen Oxford resume).
 */
const fs = require("fs");
const path = require("path");

async function resolveExecutablePath() {
  try {
    const puppeteer = require("puppeteer");
    const p = puppeteer.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {
    /* fall through */
  }

  const cacheRoot = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".cache",
    "puppeteer"
  );
  if (!fs.existsSync(cacheRoot)) return null;

  const walk = (dir) => {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, name.name);
      if (name.isDirectory()) {
        if (name.name === "Google Chrome for Testing.app") {
          const macBin = path.join(
            full,
            "Contents",
            "MacOS",
            "Google Chrome for Testing"
          );
          if (fs.existsSync(macBin)) return macBin;
        }
        const found = walk(full);
        if (found) return found;
      } else if (name.name === "chrome") {
        try {
          if (fs.statSync(full).mode & 0o111) return full;
        } catch {
          /* ignore */
        }
      }
    }
    return null;
  };

  return walk(cacheRoot);
}

async function exportResumePdf(indexHtmlPath, pdfOutPath) {
  const puppeteer = require("puppeteer-core");
  const executablePath = await resolveExecutablePath();
  if (!executablePath) {
    throw new Error("Chrome for Puppeteer not found. Run: npm run pdf:setup");
  }

  const fileUrl = `file://${indexHtmlPath}`;
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.emulateMediaType("print");
    await page.pdf({
      path: pdfOutPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "14mm",
        right: "16mm",
        bottom: "16mm",
        left: "16mm",
      },
    });
  } finally {
    await browser.close();
  }
}

module.exports = { exportResumePdf };
