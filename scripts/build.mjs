// Sync changed source files into the directory published by GitHub Pages.
// Publish the original banner and the supplied header icons with the page.
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const files = ['index.html', 'css/style.css', 'css/main.css', 'js/script.js', 'img/banner.mp4', 'img/search.svg', 'img/login.svg', 'img/shopping.svg', 'img/language.svg',
  'img/brand_img.png',
  'img/instagram.svg', 'img/kakaotalk.svg', 'img/pinterest.svg', 'img/youtube.svg', 'img/carousel-arrow.svg',
  'fonts/RIDIBatang.otf', 'fonts/PretendardVariable.woff2', 'fonts/CormorantGaramond.ttf',
  'fonts/README.md', 'fonts/Pretendard-OFL.txt', 'fonts/Cormorant-OFL.txt',
  ...['chair_3', 'table_6', 'cabinet_3', 'lighting_1', 'bed_5', 'chair_6', 'lighting_2', 'cabinet_1', 'table_2', 'cabinet_2'].map(file => `img/${file}.png`),
  ...['안뜰의 고요한 나무 의자', '고요한 한옥의 호두나무 테이블', '고요한 한옥 거실의 월넛 수납장', '한옥의 온기를 밝히는 한지 조명', '고요한 한옥의 아침-1', '한옥 선을 담은 월넛 라운지 체어', '한지빛이 머무는 저녁의 선반', '한옥의 고요 속 월넛 수납장', '고요한 한옥 안뜰의 찻상'].map(file => `img/${file}.png`),
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
