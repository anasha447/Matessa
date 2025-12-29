package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private Double totalPrice = 0.0;

    private Double discount = 0.0;
    private String couponCode;
    private List<ProductDTO> products = new ArrayList<>();
}
