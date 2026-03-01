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
            // Generate a unique filename with .webp extension
            String randomId = UUID.randomUUID().toString();
            String fileName = randomId + ".webp";

            // Ensure directory exists
            File dir = new File(path);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Build full path
            String filePath = path + File.separator + fileName;
            File destinationFile = new File(filePath);

            // Compress and convert to WebP
            // Using scale(1.0) to maintain dimensions but change format
            Thumbnails.of(image.getInputStream())
                    .scale(1.0)
                    .outputQuality(0.80) // 80% quality is a good balance
                    .outputFormat("webp")
                    .toFile(destinationFile);

            return fileName;
        } catch (Exception e) {
            // Throw a custom exception that the GlobalExceptionHandler can catch and return as a proper JSON/String response
            throw new com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler("Image upload/conversion failed: " + e.getMessage());
        }
    }
}
