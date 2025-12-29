package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
    // Returns newest messages first
    List<ContactMessage> findAllByOrderBySubmittedAtDesc();
}