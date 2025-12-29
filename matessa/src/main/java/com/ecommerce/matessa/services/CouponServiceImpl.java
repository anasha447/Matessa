package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.Coupon;
import com.ecommerce.matessa.payLoad.CouponDTO;
import com.ecommerce.matessa.repositories.CouponRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponServiceImpl implements CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CouponDTO createCoupon(CouponDTO couponDTO) {
        // 1. Validation: Check if code already exists to prevent duplicates
        if (couponRepository.findByCode(couponDTO.getCode()).isPresent()) {
            throw new ApisExceptionHandler("Coupon code already exists!");
        }

        // 2. Map DTO to Entity
        Coupon coupon = modelMapper.map(couponDTO, Coupon.class);

        // 3. Set default active status if not provided
        // (Assuming you want new coupons to be active by default)
        coupon.setActive(true);

        // 4. Save to Database
        Coupon savedCoupon = couponRepository.save(coupon);

        // 5. Return the saved data as DTO
        return modelMapper.map(savedCoupon, CouponDTO.class);
    }

    @Override
    public List<CouponDTO> getAllCoupons() {
        // Fetch all coupons and map them to DTOs
        List<Coupon> coupons = couponRepository.findAll();

        return coupons.stream()
                .map(coupon -> modelMapper.map(coupon, CouponDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public String deleteCoupon(Long couponId) {
        // 1. Check if coupon exists
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceExceptionHandler("Coupon", "id", couponId));

        // 2. Delete it
        couponRepository.delete(coupon);

        return "Coupon deleted successfully";
    }
}