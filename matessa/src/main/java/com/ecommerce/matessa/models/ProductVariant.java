package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long variantId;

    @NotBlank
    private String name; // e.g., "100g", "200g"

    @NotNull
    private Double price; // Specific price for this weight

    @NotNull
    private Integer stock; // Specific stock for this weight

    // LINK BACK TO PRODUCT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}