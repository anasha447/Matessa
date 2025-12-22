package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "Carts")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
 private Long cartId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = true)
    private  User user ;

    @OneToMany   (mappedBy = "cart", cascade = {CascadeType.PERSIST, CascadeType.MERGE,CascadeType.REMOVE}, orphanRemoval = true )
    private List<CartItem> cartItems = new ArrayList<>();


    @Column(name = "session_id")
    private String sessionId; // Stores the UUID from the cookie






    private Double totalPrice = 0.0;
}
