const fs = require('fs');
const zlib = require('zlib');

function decodePNG(buf) {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  let pos = 8;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idats.push(buf.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = width * bpp + 1;
  const out = Buffer.alloc(width * height * 4);
  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }
  for (let y = 0; y < height; y++) {
    const filter = raw[y * stride];
    const rowStart = y * stride + 1;
    const outRowStart = y * width * 4;
    const prevOutRowStart = (y - 1) * width * 4;
    for (let x = 0; x < width * 4; x++) {
      const byte = raw[rowStart + x];
      const a = x >= 4 ? out[outRowStart + x - 4] : 0;
      const b = y > 0 ? out[prevOutRowStart + x] : 0;
      const c = (x >= 4 && y > 0) ? out[prevOutRowStart + x - 4] : 0;
      let val = 0;
      if (filter === 0) val = byte;
      else if (filter === 1) val = (byte + a) & 0xff;
      else if (filter === 2) val = (byte + b) & 0xff;
      else if (filter === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (byte + paeth(a, b, c)) & 0xff;
      out[outRowStart + x] = val;
    }
  }
  return { width, height, data: out };
}

function encodePNG(width, height, data) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // Filter None
    data.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const combined = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const inputPath = 'public/images/evc-mark.png';
const { width, height, data } = decodePNG(fs.readFileSync(inputPath));
console.log('Original dimensions:', width, height);

// Find bounding box of non-white pixels
let minX = width, maxX = 0, minY = height, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    const minC = Math.min(r, g, b);
    if (minC < 240) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Bounding box:', { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY });

// Add padding of 40px
const pad = 40;
minX = Math.max(0, minX - pad);
maxX = Math.min(width - 1, maxX + pad);
minY = Math.max(0, minY - pad);
maxY = Math.min(height - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
console.log('Cropped dimensions with padding:', cropW, cropH);

// Create transparent cropped buffer
const cropData = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  const srcY = minY + y;
  for (let x = 0; x < cropW; x++) {
    const srcX = minX + x;
    const srcIdx = (srcY * width + srcX) * 4;
    const dstIdx = (y * cropW + x) * 4;
    
    const r = data[srcIdx];
    const g = data[srcIdx+1];
    const b = data[srcIdx+2];
    const minC = Math.min(r, g, b);

    if (minC >= 245) {
      // Pure white background -> fully transparent
      cropData[dstIdx] = 0;
      cropData[dstIdx+1] = 0;
      cropData[dstIdx+2] = 0;
      cropData[dstIdx+3] = 0;
    } else if (minC <= 140) {
      // Fully opaque mark
      cropData[dstIdx] = r;
      cropData[dstIdx+1] = g;
      cropData[dstIdx+2] = b;
      cropData[dstIdx+3] = 255;
    } else {
      // Anti-aliased transition edge
      const t = (minC - 140) / (245 - 140); // 0 at 140, 1 at 245
      const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - t))));
      if (alpha <= 5) {
        cropData[dstIdx] = 0;
        cropData[dstIdx+1] = 0;
        cropData[dstIdx+2] = 0;
        cropData[dstIdx+3] = 0;
      } else {
        const aNorm = alpha / 255;
        // Unblend white background
        const ur = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
        const ug = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
        const ub = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));
        cropData[dstIdx] = ur;
        cropData[dstIdx+1] = ug;
        cropData[dstIdx+2] = ub;
        cropData[dstIdx+3] = alpha;
      }
    }
  }
}

// Now let's downscale cropData to a clean 512x512 (or proportional square) with bicubic / box filter
// For maximum crispness and small file size (since it's only rendered at 24x24 to 48x48 on the card!)
const targetSize = 512;
const scale = Math.min((targetSize - 40) / cropW, (targetSize - 40) / cropH);
const targetW = Math.round(cropW * scale);
const targetH = Math.round(cropH * scale);
const offX = Math.round((targetSize - targetW) / 2);
const offY = Math.round((targetSize - targetH) / 2);

const sqData = Buffer.alloc(targetSize * targetSize * 4); // all 0 (transparent)

// Area averaging / box filter
for (let ty = 0; ty < targetH; ty++) {
  const syStart = ty / scale;
  const syEnd = (ty + 1) / scale;
  for (let tx = 0; tx < targetW; tx++) {
    const sxStart = tx / scale;
    const sxEnd = (tx + 1) / scale;

    let rSum = 0, gSum = 0, bSum = 0, aSum = 0, totalWeight = 0;

    const y0 = Math.floor(syStart);
    const y1 = Math.min(cropH, Math.ceil(syEnd));
    const x0 = Math.floor(sxStart);
    const x1 = Math.min(cropW, Math.ceil(sxEnd));

    for (let sy = y0; sy < y1; sy++) {
      const yWeight = Math.min(sy + 1, syEnd) - Math.max(sy, syStart);
      for (let sx = x0; sx < x1; sx++) {
        const xWeight = Math.min(sx + 1, sxEnd) - Math.max(sx, sxStart);
        const weight = yWeight * xWeight;
        const idx = (sy * cropW + sx) * 4;
        const a = cropData[idx+3];
        if (a > 0) {
          const aFactor = (a / 255) * weight;
          rSum += cropData[idx] * aFactor;
          gSum += cropData[idx+1] * aFactor;
          bSum += cropData[idx+2] * aFactor;
          aSum += aFactor;
        }
        totalWeight += weight;
      }
    }

    const dstIdx = ((ty + offY) * targetSize + (tx + offX)) * 4;
    if (aSum > 0.001) {
      const finalA = Math.round(Math.min(255, (aSum / totalWeight) * 255));
      sqData[dstIdx] = Math.round(rSum / aSum);
      sqData[dstIdx+1] = Math.round(gSum / aSum);
      sqData[dstIdx+2] = Math.round(bSum / aSum);
      sqData[dstIdx+3] = finalA;
    }
  }
}

const outPng = encodePNG(targetSize, targetSize, sqData);
fs.writeFileSync('public/images/evc-mark.png', outPng);
console.log('Saved transparent evc-mark.png (512x512), size:', outPng.length);
