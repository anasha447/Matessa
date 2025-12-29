package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.UserDTO;
import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long userId);
    String deleteUser(Long userId);
    // ... update methods ...
    UserDTO updateUser(Long userId, UserDTO userDTO);
}