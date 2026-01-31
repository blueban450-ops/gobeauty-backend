import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Resize image to 40x40px and overwrite or save as new file
export async function resizeImage(filePath, width = 40, height = 40) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  const resizedPath = path.join(dir, `${base}-small${ext}`);
  await sharp(filePath)
    .resize(width, height)
    .toFile(resizedPath);
  return resizedPath;
}
