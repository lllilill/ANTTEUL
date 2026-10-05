// Sync site sources and current assets into the directory published by GitHub Pages.
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const files = ['index.html', 'css/style.css', 'css/main.css', 'js/script.js', 'img/banner.mp4', 'img/search.svg', 'img/login.svg', 'img/shopping.svg', 'img/language.svg',
  'img/brand_img.png',
  'img/carousel-arrow.svg',
  'fonts/RIDIBatang.otf', 'fonts/PretendardVariable.woff2', 'fonts/CormorantGaramond.ttf',
  'fonts/README.md', 'fonts/Pretendard-OFL.txt', 'fonts/Cormorant-OFL.txt',
  ...(await readdir('img/home_section_bestseller')).filter(file => file.endsWith('.png')).map(file => `img/home_section_bestseller/${file}`),
  ...(await readdir('img/svg')).filter(file => file.endsWith('.svg')).map(file => `img/svg/${file}`),
  ...['brand', 'space', 'furniture', 'store', 'contact'].map(route => `${route}/index.html`),
  ...(await readdir('img/main')).filter(file => file.endsWith('.webp')).map(file => `img/main/${file}`)];
for (const file of files) {
  const target = join('dist', file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(file, target);
}
console.log(`Updated ${files.length} GitHub Pages files.`);
