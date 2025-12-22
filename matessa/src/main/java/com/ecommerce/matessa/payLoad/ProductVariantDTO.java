package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDTO {
    private Long variantId;
    private String name;    // "100g", "200g"
    private Double price;
    private Integer stock;
}