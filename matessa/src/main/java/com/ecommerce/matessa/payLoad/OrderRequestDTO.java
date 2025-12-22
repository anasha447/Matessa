package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    private AddressDTO shippingAddress;
    private String paymentMode; // Frontend sends "COD" or "ONLINE"
    private String pgName;
    private String pgPaymentId;
    private String pgStatus;
    private String pgResponseMessage;
    private String email;
}