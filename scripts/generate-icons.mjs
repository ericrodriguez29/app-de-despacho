import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngBuffer(width, height, r, g, b, a = 255) {
  // Simple solid color PNG generator with subtle gradient and inner border
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gradient effect
      const factor = (x + y) / (width + height);
      const pr = Math.min(255, Math.floor(r * (1 - factor * 0.3) + 20));
      const pg = Math.min(255, Math.floor(g * (1 - factor * 0.1) + 80));
      const pb = Math.min(255, Math.floor(b * (1 + factor * 0.2)));

      // Rounded corner transparent test
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.abs(x - cx);
      const ry = Math.abs(y - cy);
      const cornerRadius = width * 0.2;
      const innerW = cx - cornerRadius;
      const innerH = cy - cornerRadius;

      let alpha = a;
      if (rx > innerW && ry > innerH) {
        const dx = rx - innerW;
        const dy = ry - innerH;
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          alpha = 0;
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = alpha;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand blue: 2, 132, 199 (#0284c7)
const png192 = createPngBuffer(192, 192, 2, 132, 199);
const png512 = createPngBuffer(512, 512, 2, 132, 199);
const appleIcon = createPngBuffer(180, 180, 2, 132, 199);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Icons generated successfully in public/');
