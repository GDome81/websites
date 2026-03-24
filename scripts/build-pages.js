const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'website');
const distDir = path.join(rootDir, 'dist');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractTitle(html, fallback) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) return fallback;
  return match[1].replace(/\s+/g, ' ').trim() || fallback;
}

function humanizeFileName(fileName) {
  return fileName
    .replace(/\.html$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createIndexPage(items) {
  const cards = items.map((item) => {
    const label = escapeHtml(item.title);
    const fileName = escapeHtml(item.fileName);
    return `
      <article class="site-card">
        <div class="site-meta">${fileName}</div>
        <h2>${label}</h2>
        <div class="site-actions">
          <a href="./${fileName}">Apri sito</a>
          <a href="https://github.com/GDome81/websites/blob/main/website/${fileName}" target="_blank" rel="noopener noreferrer">Sorgente</a>
        </div>
      </article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Websites Index</title>
  <style>
    :root {
      --bg: #06111f;
      --panel: #0f2136;
      --panel-border: rgba(255, 215, 130, 0.16);
      --text: #f5eddc;
      --muted: rgba(245, 237, 220, 0.66);
      --accent: #d5a13d;
      --accent-strong: #efbf5d;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--text);
      background:
        radial-gradient(circle at top, rgba(42, 91, 146, 0.28), transparent 35%),
        linear-gradient(180deg, #06111f 0%, #081728 55%, #040b14 100%);
    }

    main {
      width: min(1080px, calc(100% - 32px));
      margin: 0 auto;
      padding: 56px 0 72px;
    }

    .hero {
      margin-bottom: 36px;
      padding: 28px;
      border: 1px solid var(--panel-border);
      background: rgba(15, 33, 54, 0.72);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      margin: 0 0 12px;
      font: 600 0.82rem/1.2 Arial, sans-serif;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
    }

    h1 {
      margin: 0 0 14px;
      font-size: clamp(2.4rem, 6vw, 4.5rem);
      line-height: 0.95;
    }

    .hero p {
      margin: 0;
      max-width: 760px;
      font: 400 1.05rem/1.65 Arial, sans-serif;
      color: var(--muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }

    .site-card {
      padding: 22px;
      border: 1px solid var(--panel-border);
      background: linear-gradient(180deg, rgba(16, 34, 56, 0.92), rgba(11, 23, 38, 0.96));
    }

    .site-meta {
      margin-bottom: 12px;
      font: 600 0.75rem/1.2 Arial, sans-serif;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .site-card h2 {
      margin: 0 0 18px;
      font-size: 1.55rem;
      line-height: 1.15;
    }

    .site-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .site-actions a {
      display: inline-block;
      padding: 11px 16px;
      color: #08111d;
      text-decoration: none;
      font: 700 0.82rem/1.2 Arial, sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: var(--accent);
    }

    .site-actions a:last-child {
      color: var(--text);
      background: transparent;
      border: 1px solid rgba(239, 191, 93, 0.4);
    }

    .footer {
      margin-top: 22px;
      font: 400 0.92rem/1.6 Arial, sans-serif;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">GitHub Pages Sandbox</p>
      <h1>Indice dei siti pubblicati</h1>
      <p>Questa pagina viene generata automaticamente dai file HTML dentro <code>website/</code>. Ogni file viene pubblicato anche direttamente nella root del sito, quindi puoi aprirlo con un URL come <code>/thebadguyde.html</code>.</p>
    </section>

    <section class="grid">
${cards}
    </section>

    <p class="footer">Per aggiungere un nuovo sito, basta inserire un nuovo file <code>.html</code> dentro <code>website/</code> e fare push su <code>main</code>.</p>
  </main>
</body>
</html>`;
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Source folder not found: ${sourceDir}`);
}

const htmlFiles = fs.readdirSync(sourceDir)
  .filter((file) => file.toLowerCase().endsWith('.html'))
  .filter((file) => file.toLowerCase() !== 'index.html')
  .sort((a, b) => a.localeCompare(b));

if (htmlFiles.length === 0) {
  throw new Error('No HTML files found in website/.');
}

cleanDir(distDir);

const items = htmlFiles.map((fileName) => {
  const sourcePath = path.join(sourceDir, fileName);
  const html = fs.readFileSync(sourcePath, 'utf8');
  const fallbackTitle = humanizeFileName(fileName);
  const extractedTitle = extractTitle(html, fallbackTitle);
  const title = /[ÂÃâð]/.test(extractedTitle) ? fallbackTitle : extractedTitle;
  const targetPath = path.join(distDir, fileName);
  fs.copyFileSync(sourcePath, targetPath);
  return { fileName, title };
});

fs.writeFileSync(path.join(distDir, 'index.html'), createIndexPage(items), 'utf8');
console.log(`Built ${items.length} HTML site(s) into ${distDir}`);
