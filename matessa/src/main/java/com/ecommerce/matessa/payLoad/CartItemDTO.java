package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {

    private Long cartItemId;
    private Long productId;

    // Display Info
    private String productName;
    private String image;
    private String variant; // e.g., "500g", "1kg"

    // ✅ 1. Regular Price (From Product)
    // Used for display (e.g., strikethrough text: ₹100)
    private double price;

    // ✅ 2. Special Price (Active Price used in logic)
    // Essential because your calculation uses: item.getProduct().getSpecialPrice()
    private double specialPrice;

    // ✅ 3. Product-Level Discount %
    // Useful for showing badges like "10% OFF" next to the item
    private double discount;

    // Quantity
    private Integer quantity;
}