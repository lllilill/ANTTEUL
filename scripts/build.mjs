// Sync changed source files into the directory published by GitHub Pages.
// Existing video and product assets are preserved.
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const files = ['index.html', 'css/style.css', 'css/main.css', 'js/script.js',
  ...['brand', 'space', 'furniture', 'store', 'contact'].map(route => `${route}/index.html`),
  ...(await readdir('img/main')).filter(file => file.endsWith('.webp')).map(file => `img/main/${file}`)];
for (const file of files) {
  const target = join('dist', file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(file, target);
}
console.log(`Updated ${files.length} GitHub Pages files.`);
