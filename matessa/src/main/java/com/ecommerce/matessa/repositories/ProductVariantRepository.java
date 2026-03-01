package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Helper: Find all variants for a specific product (Useful for displaying options on the Product Page)
    List<ProductVariant> findByProductProductId(Long productId);
}