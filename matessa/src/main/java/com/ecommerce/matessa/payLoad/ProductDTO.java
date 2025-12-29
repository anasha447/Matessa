package com.ecommerce.matessa.payLoad;
import com.ecommerce.matessa.dtos.ProductFlavorDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long productId;

    @NotBlank
    @Size(min = 3, max = 25)
    private String productName;

    @NotBlank
    @Size(min = 10, max = 100)
    private String description;

    private List<String> images = new ArrayList<>();

    @NotNull
    @PositiveOrZero
    private Double price;

    @NotNull
    @PositiveOrZero
    private Double discount;

    private Double specialPrice;
    private Long categoryId;
    @PositiveOrZero
    private int quantity;
    private String variant;
    private Long variantId;
    private List<ProductVariantDTO> variants = new ArrayList<>();
    private List<ProductFlavorDTO> flavors = new ArrayList<>();
}