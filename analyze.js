const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const inputFolder = path.join(__dirname, 'assets');
const outputFile = path.join(__dirname, 'data.json');

const COLOR_LEFT = '#262B00';
const COLOR_RIGHT = '#9BAC10';
const COLOR_RIGHT_ALT = '#87970D';

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x =>
    x.toString(16).padStart(2, '0').toUpperCase()
  ).join('');
}

async function processImage(filePath) {
  const img = await loadImage(filePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);

  const points = [];

  for (let y = 0; y < img.height; y++) {
    let x = 0;

    while (x < img.width - 1) {
      const i1 = (y * img.width + x) * 4;
      const i2 = (y * img.width + x + 1) * 4;

      const color1 = rgbToHex(data[i1], data[i1 + 1], data[i1 + 2]);
      const color2 = rgbToHex(data[i2], data[i2 + 1], data[i2 + 2]);

      if (points.length < 2 && color1 === COLOR_LEFT && color2 === COLOR_RIGHT) {
        points.push({ x, y });
        points.push({ x: x + 1, y });
        x += 2;
        continue;
      }

      if (points.length === 2 &&
        (color1 === COLOR_RIGHT || color1 === COLOR_RIGHT_ALT) &&
        color2 === COLOR_LEFT) {
        points.push({ x, y });
        points.push({ x: x + 1, y });
        return points;
      }

      x++;
    }
  }

  return points;
}

async function processAllImages() {
  const files = await fs.readdir(inputFolder);
  const results = {};

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const fullPath = path.join(inputFolder, file);
    const data = await processImage(fullPath);
    results[file] = data;
  }

  await fs.writeJson(outputFile, results, { spaces: 2 });
  console.log('Data saved to', outputFile);
}

processAllImages();
