package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.Category;
import com.ecommerce.matessa.payLoad.CategoryDTO;
import com.ecommerce.matessa.payLoad.CategoryResponse;
import com.ecommerce.matessa.repositories.CategoryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private ModelMapper modelMapper;

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponse getAllCategories() {
        List<Category> categories = categoryRepository.findAll();

        // ❌ DELETE THIS: if (categories.isEmpty()) throw ...

        // ✅ ADD THIS: Handle empty list gracefully
        if (categories.isEmpty()) {
            CategoryResponse emptyResponse = new CategoryResponse();
            emptyResponse.setContent(new ArrayList<>());
            return emptyResponse;
        }

        List<CategoryDTO> categoriesDTO = categories.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());

        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setContent(categoriesDTO);
        return categoryResponse;
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = modelMapper.map(categoryDTO, Category.class);
        Category categoryFromDB = categoryRepository.findByCategoryName(category.getCategoryName());

        if (categoryFromDB != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category " + category.getCategoryName() + " already exists");
        }

        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    @Override
    public CategoryDTO deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceExceptionHandler("category", "categoryId", categoryId));

        categoryRepository.delete(category);
        return modelMapper.map(category, CategoryDTO.class);
    }

    @Override
    public CategoryDTO updateCategory(Long categoryId, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceExceptionHandler("Category", "categoryId", categoryId));

        Category category = modelMapper.map(categoryDTO, Category.class);

        // Check for duplicate category name (but exclude the same category)
        Category duplicate = categoryRepository.findByCategoryName(category.getCategoryName());
        if (duplicate != null && !duplicate.getCategoryId().equals(categoryId)) {
            throw new ApisExceptionHandler("Category name " + category.getCategoryName() + " already exists");
        }

        existingCategory.setCategoryName(category.getCategoryName());
        return modelMapper.map(categoryRepository.save(existingCategory), CategoryDTO.class);
    }
}