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
@Table(name = "product_flavors")
public class ProductFlavor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long flavorId;

    @NotBlank
    private String flavorName; // e.g., "Lemon & Ginger"

    // This stores the ID of the sibling product to navigate to
    @NotNull
    private Long targetProductId;

    private String colorCode; // Optional: e.g., "#F3CB57" for UI buttons

    // LINK BACK TO PRODUCT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}