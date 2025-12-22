package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.models.Category;
import com.ecommerce.matessa.payLoad.CategoryDTO;
import com.ecommerce.matessa.payLoad.CategoryResponse;
import com.ecommerce.matessa.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getAllCategories() {
        CategoryResponse categoryResponse = categoryService.getAllCategories();
        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    @PostMapping("/admin/public/categories")
    public ResponseEntity <CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO savedCategoryDTO = categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED );
    }

    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity <CategoryDTO> deleteCategory(@Valid @PathVariable Long categoryId) {

            CategoryDTO deleteCategory = categoryService.deleteCategory(categoryId);
            return new ResponseEntity<>(deleteCategory, HttpStatus.OK);
    }
    @PutMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@Valid @PathVariable Long categoryId,
                                                   @RequestBody CategoryDTO categoryDTO) {

            CategoryDTO updatedCategoryDTO = categoryService.updateCategory(categoryId, categoryDTO);
            return new ResponseEntity<>(updatedCategoryDTO, HttpStatus.OK);

    }
}