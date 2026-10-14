#!/usr/bin/env node
/**
 * Build GitHub Pages resume from README.md + export PDF/Word from web layout.
 */
const fs = require("fs");
const path = require("path");
const HTMLtoDOCX = require("html-to-docx");
const { buildOxfordResumeHtml } = require("./oxford-html");
const { exportResumePdf } = require("./export-resume-pdf");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const ASSETS = path.join(DOCS, "assets");
const README = path.join(ROOT, "README.md");
const PDF_DST = path.join(ASSETS, "Chin_Trinh_Resume.pdf");
const DOCX_DST = path.join(ASSETS, "Chin_Trinh_Resume.docx");
const INDEX = path.join(DOCS, "index.html");

const ICON_PDF = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>`;

const ICON_DOCX = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2l1.5 4 1.5-4h2"/></svg>`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseResumeHeadline(markdown) {
  const lines = markdown.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t === "---") continue;
    if (t.startsWith("##")) break;
    if (t.startsWith("[") || t.includes("@")) continue;
    return t;
  }
  return "";
}

function wrapPage(resumeInnerHtml, headline) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Chin Trịnh — Senior React Native Engineer · Full Stack JavaScript. Resume." />
  <title>Chin Trịnh — Resume</title>
  <link rel="stylesheet" href="./css/oxford.css" />
</head>
<body>
  <div class="fab-stack" role="group" aria-label="Download resume">
    <a class="fab" href="./assets/Chin_Trinh_Resume.pdf" download="Chin_Trinh_Resume.pdf" title="Download PDF">
      ${ICON_PDF}
      <span class="fab__label">PDF</span>
    </a>
    <a class="fab fab--docx" href="./assets/Chin_Trinh_Resume.docx" download="Chin_Trinh_Resume.docx" title="Download Word">
      ${ICON_DOCX}
      <span class="fab__label">Word</span>
    </a>
  </div>

  <main class="page" id="resume">
    <header class="resume-header">
      <h1>Chin Trịnh</h1>
      ${headline ? `<p class="resume-headline">${headline}</p>` : ""}
      <p class="contact-line">+84 70 449 8756 · <a href="mailto:trinhchinchin@gmail.com">trinhchinchin@gmail.com</a></p>
      <p class="contact-line">Ho Chi Minh City, Vietnam · <a href="https://github.com/chnirt">github.com/chnirt</a> · <a href="https://www.linkedin.com/in/chnirt">linkedin.com/in/chnirt</a></p>
    </header>
    <article class="resume-body">
      ${resumeInnerHtml}
    </article>
  </main>
</body>
</html>`;
}

function docxHtml(resumeInnerHtml, headline) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: Times New Roman, serif; font-size: 11pt; color: #000;">
  <h1 style="text-align:center; font-size: 18pt; text-transform: uppercase; margin-bottom: 8px;">Chin Trịnh</h1>
  ${headline ? `<p style="text-align:center; margin: 0 0 8px; font-size: 11pt;">${headline}</p>` : ""}
  <p style="text-align:center; margin: 4px 0;">+84 70 449 8756 · trinhchinchin@gmail.com</p>
  <p style="text-align:center; margin: 4px 0 12px;">Ho Chi Minh City, Vietnam · github.com/chnirt · linkedin.com/in/chnirt</p>
  <hr style="border: none; border-top: 1px solid #000; margin-bottom: 12px;" />
  ${resumeInnerHtml}
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(README)) {
    console.error("README.md not found");
    process.exit(1);
  }

  ensureDir(ASSETS);

  const markdown = fs.readFileSync(README, "utf8");
  const headline = parseResumeHeadline(markdown);
  const resumeInner = buildOxfordResumeHtml(markdown);

  fs.writeFileSync(INDEX, wrapPage(resumeInner, headline), "utf8");
  console.log("Wrote docs/index.html");

  const docxBuffer = await HTMLtoDOCX(docxHtml(resumeInner, headline), null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
  });
  fs.writeFileSync(DOCX_DST, docxBuffer);
  console.log("Wrote docs/assets/Chin_Trinh_Resume.docx");

  try {
    await exportResumePdf(INDEX, PDF_DST);
    console.log("Wrote docs/assets/Chin_Trinh_Resume.pdf (from web layout)");
  } catch (err) {
    console.warn("PDF export failed:", err.message);
    console.warn("Run npm run pdf:setup then npm run site again.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
