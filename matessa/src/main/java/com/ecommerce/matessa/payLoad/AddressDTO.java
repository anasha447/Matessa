package com.ecommerce.matessa.payLoad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
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
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Phone must be 8–15 digits")
    private String phoneNumber;
}