package com.ecommerce.matessa.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @NotBlank
    @Size(min = 5, max = 100)
    private String addressLine1;

    private String addressLine2;
    private String street;
    private String buildingName;

    @NotBlank
    @Size(min = 2, max = 50)
    private String city;

    @NotBlank
    @Size(min = 2, max = 50)
    private String state;

    @NotBlank
    @Size(min = 2, max = 50)
    private String country;

    @NotBlank
    @Size(min = 5, max = 15)
    private String pincode;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{8,15}$")
    private String phoneNumber;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Constructor used for testing or manual creation
    public Address(String addressLine1, String addressLine2, String street, String buildingName,
                   String city, String state, String country, String pincode, String phoneNumber, User user) {
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.street = street;
        this.buildingName = buildingName;
        this.city = city;
        this.state = state;
        this.country = country;
        this.pincode = pincode;
        this.phoneNumber = phoneNumber;
        this.user = user;
    }
}