package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.CouponDTO;

import java.util.List;

public interface CouponService {
    CouponDTO createCoupon(CouponDTO couponDTO);
    List<CouponDTO> getAllCoupons();
    String deleteCoupon(Long couponId);
}
