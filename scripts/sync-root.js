const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  throw new Error('dist/ not found. Run node scripts/build-pages.js first.');
}

const htmlFiles = fs.readdirSync(distDir)
  .filter((file) => file.toLowerCase().endsWith('.html'));

for (const fileName of htmlFiles) {
  fs.copyFileSync(path.join(distDir, fileName), path.join(rootDir, fileName));
}

const noJekyllPath = path.join(rootDir, '.nojekyll');
if (!fs.existsSync(noJekyllPath)) {
  fs.writeFileSync(noJekyllPath, '', 'utf8');
}

console.log(`Synced ${htmlFiles.length} HTML file(s) to repository root.`);
