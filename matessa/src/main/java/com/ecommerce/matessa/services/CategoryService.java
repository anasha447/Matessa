package com.ecommerce.matessa.services;

import com.ecommerce.matessa.models.Category;
import com.ecommerce.matessa.payLoad.CategoryDTO;
import com.ecommerce.matessa.payLoad.CategoryResponse;

public interface CategoryService {

    CategoryResponse getAllCategories();

    CategoryDTO createCategory(CategoryDTO categoryDTO);

    CategoryDTO deleteCategory(Long categoryId);

    CategoryDTO  updateCategory(Long categoryId, CategoryDTO categoryDTO);
}
