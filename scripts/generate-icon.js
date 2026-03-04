// Generates a 128x128 PNG icon for Afora
// Colored braces "{}" on a dark background
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const WIDTH = 128;
const HEIGHT = 128;

// Colors
const BG = [30, 30, 30];       // #1e1e1e dark background
const ORANGE = [255, 165, 0];   // rainbow1
const PINK = [255, 20, 147];    // rainbow2
const GREEN = [154, 205, 50];   // rainbow3

// Simple bitmap font for "{ }" - each char is 5x7 grid
const OPEN_BRACE = [
  [0,0,1,1,0],
  [0,1,0,0,0],
  [0,1,0,0,0],
  [1,0,0,0,0],
  [0,1,0,0,0],
  [0,1,0,0,0],
  [0,0,1,1,0],
];

const CLOSE_BRACE = [
  [1,1,0,0,0],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [0,0,0,0,1],
  [0,0,0,1,0],
  [0,0,0,1,0],
  [1,1,0,0,0],
];

function drawScaledChar(pixels, charMap, startX, startY, scale, color) {
  for (let row = 0; row < charMap.length; row++) {
    for (let col = 0; col < charMap[0].length; col++) {
      if (charMap[row][col]) {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = startX + col * scale + sx;
            const py = startY + row * scale + sy;
            if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
              const idx = (py * WIDTH + px) * 3;
              pixels[idx] = color[0];
              pixels[idx + 1] = color[1];
              pixels[idx + 2] = color[2];
            }
          }
        }
      }
    }
  }
}

// Create pixel buffer (RGB)
const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);
// Fill background
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  pixels[i * 3] = BG[0];
  pixels[i * 3 + 1] = BG[1];
  pixels[i * 3 + 2] = BG[2];
}

// Draw a rounded-corner rectangle border
const BORDER_COLOR = [60, 60, 60];
const BORDER_R = 10;
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    let onBorder = false;
    if (x < 2 || x >= WIDTH - 2 || y < 2 || y >= HEIGHT - 2) {
      // Check if within rounded corners
      const corners = [
        [BORDER_R, BORDER_R],
        [WIDTH - 1 - BORDER_R, BORDER_R],
        [BORDER_R, HEIGHT - 1 - BORDER_R],
        [WIDTH - 1 - BORDER_R, HEIGHT - 1 - BORDER_R]
      ];
      let inCornerZone = false;
      for (const [cx, cy] of corners) {
        if ((x < BORDER_R && y < BORDER_R) ||
            (x >= WIDTH - BORDER_R && y < BORDER_R) ||
            (x < BORDER_R && y >= HEIGHT - BORDER_R) ||
            (x >= WIDTH - BORDER_R && y >= HEIGHT - BORDER_R)) {
          inCornerZone = true;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist <= BORDER_R && dist >= BORDER_R - 2) {
            onBorder = true;
          }
          if (dist > BORDER_R) {
            // Outside corner - make transparent-ish (darker)
            const idx = (y * WIDTH + x) * 3;
            pixels[idx] = 20;
            pixels[idx + 1] = 20;
            pixels[idx + 2] = 20;
          }
        }
      }
      if (!inCornerZone) {
        onBorder = true;
      }
    }
    if (onBorder) {
      const idx = (y * WIDTH + x) * 3;
      pixels[idx] = BORDER_COLOR[0];
      pixels[idx + 1] = BORDER_COLOR[1];
      pixels[idx + 2] = BORDER_COLOR[2];
    }
  }
}

// Scale = 4 pixels per "font pixel", chars are 5*4=20px wide, 7*4=28px tall
const scale = 4;
const charW = 5 * scale; // 20
const charH = 7 * scale; // 28
const gap = 8;
const totalW = charW * 2 + gap; // 48
const startX = Math.floor((WIDTH - totalW) / 2);
const startY = Math.floor((HEIGHT - charH) / 2);

drawScaledChar(pixels, OPEN_BRACE, startX, startY, scale, ORANGE);
drawScaledChar(pixels, CLOSE_BRACE, startX + charW + gap, startY, scale, GREEN);

// Encode as PNG
function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type (RGB)
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// IDAT - prepare raw image data with filter bytes
const rawData = Buffer.alloc(HEIGHT * (1 + WIDTH * 3));
for (let y = 0; y < HEIGHT; y++) {
  rawData[y * (1 + WIDTH * 3)] = 0; // filter: none
  for (let x = 0; x < WIDTH * 3; x++) {
    rawData[y * (1 + WIDTH * 3) + 1 + x] = pixels[y * WIDTH * 3 + x];
  }
}
const compressed = zlib.deflateSync(rawData);

// Build PNG
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([
  signature,
  makeChunk('IHDR', ihdr),
  makeChunk('IDAT', compressed),
  makeChunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.join(__dirname, '..', 'images', 'icon.png');
fs.writeFileSync(outPath, png);
console.log(`Icon written to ${outPath} (${png.length} bytes)`);
