package com.ecommerce.matessa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.matessa.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByCategoryName(String categoryName);
}
