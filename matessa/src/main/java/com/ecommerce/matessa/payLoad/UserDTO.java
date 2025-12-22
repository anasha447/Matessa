package com.ecommerce.matessa.payLoad;

import com.ecommerce.matessa.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long userId;
    private String userName;
    private String email;
    private String phoneNo;

    // We typically send Roles directly if the Role entity is small (ID + Name)
    // Or you can make a RoleDTO if you want to be stricter.
    private List<String> roles = new ArrayList<>();
    // Using AddressDTO prevents infinite recursion (User -> Address -> User)
    private List<AddressDTO> addresses = new ArrayList<>();

    // Optional: If you plan to add Profile Images later
    // private String image;

    // Optional: If you want to show Cart ID without loading the whole Cart
    private Long cartId;
}