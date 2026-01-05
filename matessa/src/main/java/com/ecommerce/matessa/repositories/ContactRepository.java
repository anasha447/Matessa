package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
    // Returns newest messages first
    List<ContactMessage> findAllByOrderBySubmittedAtDesc();
}