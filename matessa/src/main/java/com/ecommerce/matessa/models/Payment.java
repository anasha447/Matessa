package com.ecommerce.matessa.models;

import com.ecommerce.matessa.models.PaymentMode;
import com.ecommerce.matessa.models.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @OneToOne(mappedBy = "payment", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private Order order;

    // ✅ CHANGED: Use Enum for strict control (ONLINE vs COD)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    // This stores "Razorpay", "Stripe", or "Cash"
    private String pgName;

    // Nullable because COD won't have this immediately
    private String pgPaymentId;

    // ✅ CHANGED: Use Enum for status logic
    @Enumerated(EnumType.STRING)
    private PaymentStatus pgStatus;

    private String pgResponseMessage;

    // Constructor for Logic
    public Payment(PaymentMode paymentMode, String pgName, String pgPaymentId,
                   PaymentStatus pgStatus, String pgResponseMessage) {
        this.paymentMode = paymentMode;
        this.pgName = pgName;
        this.pgPaymentId = pgPaymentId;
        this.pgStatus = pgStatus;
        this.pgResponseMessage = pgResponseMessage;
    }
}