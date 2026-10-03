// Sync changed source files into the directory published by GitHub Pages.
// Publish the original banner and the supplied header icons with the page.
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const files = ['index.html', 'css/style.css', 'css/main.css', 'js/script.js', 'img/banner.mp4', 'img/search.svg', 'img/login.svg', 'img/shopping.svg', 'img/language.svg',
  ...['brand', 'space', 'furniture', 'store', 'contact'].map(route => `${route}/index.html`),
  ...(await readdir('img/main')).filter(file => file.endsWith('.webp')).map(file => `img/main/${file}`)];
for (const file of files) {
  const target = join('dist', file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(file, target);
}
console.log(`Updated ${files.length} GitHub Pages files.`);
