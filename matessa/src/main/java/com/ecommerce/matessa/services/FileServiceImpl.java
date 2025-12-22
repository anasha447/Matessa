package com.ecommerce.matessa.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService{
    @Override
    public String uploadImage(String path, MultipartFile image) {
        try {
            // Get original filename
            String originalFilename = image.getOriginalFilename();

            // Generate a unique filename (e.g., "uuid.jpg")
            String randomId = UUID.randomUUID().toString();
            String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String fileName = randomId + extension;

            // Ensure directory exists
            File dir = new File(path);
            if (!dir.exists()) {
                dir.mkdirs(); // create directory if missing
            }

            // Build full path and copy file
            String filePath = path + File.separator + fileName;
            Files.copy(image.getInputStream(), Paths.get(filePath));

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }
}
