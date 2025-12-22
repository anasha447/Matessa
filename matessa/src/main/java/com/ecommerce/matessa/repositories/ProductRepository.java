package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Category;
import com.ecommerce.matessa.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryOrderByPrice( Category category);

    List<Product> findByProductNameContainingIgnoreCase (String keywords);
}
