package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Table(name = "products")
@ToString(exclude = {"products", "variants", "flavors"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long productId;

    /**
     * SEO-friendly URL slug, e.g. "premium-yerba-mate-500g".
     *
     * Rules:
     * - Generated and guaranteed unique by {@link com.ecommerce.matessa.util.SlugUtil}
     *   inside the Service layer BEFORE every save.
     * - NEVER generated here in the lifecycle hook (no DB access = no uniqueness check).
     * - Column is UNIQUE — the DB is the final safety net.
     */
    @Column(unique = true)
    private String slug;

    @NotBlank
    @Size(min = 3, max = 50, message = "product name must be between 3 and 50 characters")
    private String productName;

    @NotBlank
    @Size(min = 10, max = 4000, message = "product description must be between 10 and 2000 characters")
    @Column(length = 4000)
    private String description;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    @NotNull
    private Double price;

    @NotNull
    private Double discount;

    private Double specialPrice;

    private int quantity;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductFlavor> flavors = new ArrayList<>();

    /**
     * JPA lifecycle hook: only handles pure arithmetic (specialPrice).
     *
     * Slug is intentionally NOT set here — slug generation requires a uniqueness
     * check against the DB, which is impossible inside a lifecycle callback.
     * Slug is assigned by ProductServiceImpl via SlugUtil before every save().
     */
    @PrePersist
    @PreUpdate
    public void onSave() {
        if (price != null && discount != null) {
            this.specialPrice = price - ((discount * 0.01) * price);
        }
    }

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User user;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    private List<CartItem> products = new ArrayList<>();

    public String getImage() {
        if (images != null && !images.isEmpty()) {
            return images.get(0);
        }
        return null;
    }
}