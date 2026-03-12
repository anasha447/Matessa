import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// In modern ES modules, we use process.cwd() to get the current directory
const assetsDir = path.join(process.cwd(), 'src', 'assets');

async function convertToWebp(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // If it's a folder, search inside it recursively
        if (stat.isDirectory()) {
            await convertToWebp(filePath);
        } else {
            // If it's a jpg, jpeg, or png, convert it
            const ext = path.extname(file).toLowerCase();
            if (ext === '.webp' || ext === '.webp' || ext === '.webp') {
                const newFilePath = filePath.replace(ext, '.webp');

                try {
                    await sharp(filePath)
                        .webp({ quality: 80 }) // 80% quality
                        .toFile(newFilePath);
                    
                    console.log(`✅ Converted: ${file} -> ${path.basename(newFilePath)}`);
                } catch (err) {
                    console.error(`❌ Error converting ${file}:`, err);
                }
            }
        }
    }
}

console.log('Starting image conversion...');
convertToWebp(assetsDir).then(() => {
    console.log('🎉 All images converted to WebP successfully!');
});