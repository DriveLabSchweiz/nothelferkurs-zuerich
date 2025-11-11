import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const imagesDir = './public/images';

async function convertImages() {
  const files = await readdir(imagesDir);
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = join(imagesDir, file);
      const outputPath = join(imagesDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      
      try {
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);
        console.log(`✓ Converted ${file} to WebP`);
      } catch (error) {
        console.error(`✗ Failed to convert ${file}:`, error.message);
      }
    }
  }
}

convertImages().then(() => console.log('Image conversion complete!'));
