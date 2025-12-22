package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "products")
@ToString(exclude = {"products", "variants", "flavors"}) // Prevent infinite loops in logs
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long productId;

    @NotBlank
    @Size(min = 3, max = 50, message = "product name must be between 3 and 50 characters") // Increased max size
    private String productName;

    @NotBlank
    @Size(min = 10, max = 1000, message = "product description must be between 10 and 1000 characters") // Increased for description
    private String description;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    @NotNull
    private Double price; // Base price

    @NotNull
    private Double discount;

    private Double specialPrice;

    private int quantity; // Base quantity (total)

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // ✅ NEW: Relationship to Weight Variants
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    // ✅ NEW: Relationship to Flavors
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductFlavor> flavors = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void calculateSpecialPrice() {
        if (price != null && discount != null) {
            this.specialPrice = price - ((discount * 0.01) * price);
        }
    }

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User user;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private List<CartItem> products = new ArrayList<>();
}