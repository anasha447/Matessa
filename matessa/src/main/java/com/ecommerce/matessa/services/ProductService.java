package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.ProductDTO;
import com.ecommerce.matessa.payLoad.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProductService {
    ProductDTO addProduct(Long categoryId, ProductDTO product);

    ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortDir);

    ProductResponse searchByCategory(Long categoryId);

    ProductResponse searchByKeywords(String keywords);

    ProductDTO updateProduct(Long productId, ProductDTO product);

    ProductDTO deleteProduct(Long productId);

    Object updateProductImage(Long productId, MultipartFile image) throws IOException;

    ProductDTO getProductById(Long productId);

    ProductDTO updateImageProduct(Long productId, MultipartFile image);

    ProductDTO deleteProductImage(Long productId, String fileName);

    ProductDTO uploadImageProduct(Long productId, MultipartFile image);
}
