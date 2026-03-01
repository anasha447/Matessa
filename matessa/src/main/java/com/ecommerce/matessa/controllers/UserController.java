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
    // ==========================================
    // 4. UPDATE USER PROFILE
    // Matches Frontend: authSlice -> updateUserProfile (PUT /api/users/profile)
    // ==========================================
    @PutMapping("/users/profile")
    public ResponseEntity<UserDTO> updateUserProfile(@RequestBody UserDTO userDTO) {
        // Since we are updating "me", we get ID from SecurityContext or ignore ID in DTO?
        // Let's assume we get the logged-in user's ID
        // But for simplicity/speed, if the frontend sends the ID in the body or we can get it from AuthUtil

        // Let's use AuthUtil if available, otherwise assume basic Update Logic
        // But wait, I don't have AuthUtil injected here. Let's inject it.
        // Actually, let's keep it simple: pass userId in DTO or Path if needed?
        // The slice calls `api.put('/users/profile', userData)`.

        // I need the current user's ID.
        // Let's rely on SecurityContextHolder in a Helper or manually here.
        // Since I can't easily modify AuthUtil right now without reading it,
        // I'll try to get Authentication object directly.

        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        // Assuming your UserDetailsImpl has getUserId()
        if (authentication == null || !authentication.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Cast principal to UserDetailsImpl (assuming it exists based on AuthController code I saw earlier)
        com.ecommerce.matessa.security.Services.UserDetailsImpl userDetails =
                (com.ecommerce.matessa.security.Services.UserDetailsImpl) authentication.getPrincipal();

        Long userId = userDetails.getUserId();

        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
}