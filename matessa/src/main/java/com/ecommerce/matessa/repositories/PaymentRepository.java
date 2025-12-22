package com.ecommerce.matessa.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.matessa.models.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>{

}