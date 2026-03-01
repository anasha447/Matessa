package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long couponId;
    private String code;
    private double discountPercentage;
    private boolean isActive;
}