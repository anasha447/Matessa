package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.payLoad.UserDTO;
import com.ecommerce.matessa.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    // ==========================================
    // 1. GET ALL USERS (Admin Only)
    // Matches Frontend: userSlice -> fetchAllUsers
    // ==========================================
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // ==========================================
    // 2. GET SINGLE USER
    // Matches Frontend: userSlice -> fetchUserDetails
    // ==========================================
    @GetMapping("/admin/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // ==========================================
    // 3. DELETE USER
    // Matches Frontend: userSlice -> deleteUser
    // ==========================================
    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        String status = userService.deleteUser(userId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}