package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.configs.AppConstants;
import com.ecommerce.matessa.models.Product;
import com.ecommerce.matessa.payLoad.ProductDTO;
import com.ecommerce.matessa.payLoad.ProductResponse;
import com.ecommerce.matessa.repositories.ProductRepository;
import com.ecommerce.matessa.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;


@RestController
@RequestMapping("/api")
public class ProductController {
    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/admin/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(@PathVariable Long categoryId, @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO savedProductDTO = productService.addProduct(categoryId, productDTO);
        return new ResponseEntity<>(savedProductDTO, HttpStatus.CREATED);
    }

    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCT_BY, required = false) String sortBy,
            @RequestParam(name = "sortDir", defaultValue = AppConstants.SORT_DIR, required = false) String sortDir
    ) {
        ProductResponse productResponse = productService.getAllProducts(pageNumber, pageSize, sortBy, sortDir);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);

    }

    @GetMapping("/public/categories/{categoryId}/products")
    public ResponseEntity<ProductResponse> getProductsByCategory(@PathVariable Long categoryId) {
        ProductResponse productResponse = productService.searchByCategory(categoryId);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    @GetMapping("/public/products/keywords/{keywords}")
    public ResponseEntity<ProductResponse> getProductsByKeywords(@PathVariable String keywords) {
        ProductResponse productResponse = productService.searchByKeywords(keywords);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long productId,
                                                    @Valid @RequestBody ProductDTO productDTO) {

        ProductDTO updateProductDTO = productService.updateProduct(productId, productDTO);
        return new ResponseEntity<>(updateProductDTO, HttpStatus.OK);

    }

    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Long productId) {
        ProductDTO deleteProductDTO = productService.deleteProduct(productId);
        return new ResponseEntity<>(deleteProductDTO, HttpStatus.OK);
    }

    @RequestMapping(value = "/admin/products/{productId}/image", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile image) {

        try {
            // Service logic now handles "Adding to list" (Max 5 checks)
            ProductDTO updatedProduct = productService.uploadImageProduct(productId, image);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            // Return a clean JSON error message instead of a 500 stack trace
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new com.ecommerce.matessa.payLoad.APIResponse(e.getMessage(), "error"));
        }
    }

    // ✅ 2. DELETE IMAGE (Removes specific image from the list)
    @DeleteMapping("/admin/products/{productId}/image/{fileName}")
    public ResponseEntity<ProductDTO> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable String fileName) {

        ProductDTO updatedProduct = productService.deleteProductImage(productId, fileName);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // ✅ 3. SERVE IMAGE (View image in browser/frontend)
    @GetMapping("/public/images/{fileName}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        try {
            // ⚠️ This "images/" must match the path in your application.properties
            String path = "images/";

            Path filePath = Paths.get(path).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream";
                String lowerName = fileName.toLowerCase();
                if (lowerName.endsWith(".png")) contentType = "image/png";
                else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (lowerName.endsWith(".webp")) contentType = "image/webp";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅✅ THIS WAS MISSING: Get Single Product By ID
    @GetMapping("/public/products/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        ProductDTO productDTO = productService.getProductById(productId);
        return new ResponseEntity<>(productDTO, HttpStatus.OK);
    }

}
