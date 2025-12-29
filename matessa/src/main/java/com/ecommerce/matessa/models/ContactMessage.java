package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    private String name;
    private String email;
    private String subject;

    @Column(length = 5000) // Allow longer messages
    private String message;

    private LocalDateTime submittedAt;

    private boolean isRead = false; // Tracks if you have opened it
}