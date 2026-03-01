package com.ecommerce.matessa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.matessa.models.Category;
import org.springframework.stereotype.Repository;

@Repository

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByCategoryName(String categoryName);
}
