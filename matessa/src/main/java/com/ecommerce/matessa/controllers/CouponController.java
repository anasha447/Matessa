package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.payLoad.CouponDTO;
import com.ecommerce.matessa.services.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO couponDTO) {
        return new ResponseEntity<>(couponService.createCoupon(couponDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return new ResponseEntity<>(couponService.getAllCoupons(), HttpStatus.OK);
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<String> deleteCoupon(@PathVariable Long couponId) {
        return new ResponseEntity<>(couponService.deleteCoupon(couponId), HttpStatus.OK);
    }
}