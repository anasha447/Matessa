package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    // To check duplicates
    boolean existsByEmail(String email);
}