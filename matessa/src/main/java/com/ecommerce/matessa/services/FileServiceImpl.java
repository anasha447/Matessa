package com.ecommerce.matessa.services;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadImage(String path, MultipartFile image) {
        try {
            // ✅ FIX 1: Change to .jpg extension
            String randomId = UUID.randomUUID().toString();
            String fileName = randomId + ".jpg";

            // Ensure directory exists
            File dir = new File(path);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Build full path
            String filePath = path + File.separator + fileName;
            File destinationFile = new File(filePath);

            // Compress and convert to JPG
            // Using scale(1.0) to maintain dimensions
            Thumbnails.of(image.getInputStream())
                    .scale(1.0)
                    .outputQuality(0.80) // 80% quality is a good balance
                    // ✅ FIX 2: Tell Java to output as a standard jpg
                    .outputFormat("jpg")
                    .toFile(destinationFile);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }
}