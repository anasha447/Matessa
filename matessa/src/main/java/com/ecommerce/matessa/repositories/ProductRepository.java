package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Category;
import com.ecommerce.matessa.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryOrderByPrice(Category category);

    List<Product> findByProductNameContainingIgnoreCase(String keywords);

    // ✅ Slug-based lookup for SEO-friendly URLs (no numeric ID exposure)
    Optional<Product> findBySlug(String slug);

    // ✅ Fast uniqueness check — used by SlugUtil to guarantee no collisions
    boolean existsBySlug(String slug);

    // ✅ Dashboard: count low-stock products
    long countByQuantityLessThan(int threshold);
}
