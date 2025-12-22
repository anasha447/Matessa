package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.models.AppRole;
import com.ecommerce.matessa.models.Role;
import com.ecommerce.matessa.models.User;
import com.ecommerce.matessa.payLoad.AddressDTO; // Import your DTOs
import com.ecommerce.matessa.payLoad.UserDTO;
import com.ecommerce.matessa.repositories.RoleRepository;
import com.ecommerce.matessa.repositories.UserRepository;
import com.ecommerce.matessa.security.JwtUtils;
import com.ecommerce.matessa.security.Services.UserDetailsImpl;
import com.ecommerce.matessa.security.request.LoginRequest;
import com.ecommerce.matessa.security.request.SignupRequest;
import com.ecommerce.matessa.security.response.MessageResponse;
import com.ecommerce.matessa.security.response.UserInfoResponse;
import com.ecommerce.matessa.services.CartService;
import com.ecommerce.matessa.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    CartService cartService;

    @Autowired
    CookieUtil cookieUtil;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest,
                                              HttpServletRequest request,
                                              HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (AuthenticationException ex) {
            logger.error("Authentication failed for email '{}': {}", loginRequest.getEmail(), ex.getMessage());
            Map<String, Object> map = new HashMap<>();
            map.put("message", "Bad credentials");
            map.put("status", false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Merge Logic
        String guestSessionId = cookieUtil.getGuestSessionId(request);
        if (guestSessionId != null) {
            try {
                cartService.mergeCarts(userDetails.getEmail(), guestSessionId);
                cookieUtil.deleteGuestCookie(response);
            } catch (Exception e) {
                logger.error("Error merging carts: {}", e.getMessage());
            }
        }

        // We return standard UserInfoResponse for login (token set in cookie)
        UserInfoResponse userInfoResponse = new UserInfoResponse(userDetails.getUserId(),
                userDetails.getUsername(), roles, jwtCookie.toString());

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(userInfoResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest,
                                          HttpServletRequest request,
                                          HttpServletResponse response) {

        if (userRepository.existsByUserName(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "seller":
                        Role modRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Merge Logic
        String guestSessionId = cookieUtil.getGuestSessionId(request);
        if (guestSessionId != null) {
            try {
                cartService.mergeCarts(signUpRequest.getEmail(), guestSessionId);
                cookieUtil.deleteGuestCookie(response);
            } catch (Exception e) {
                logger.error("Error merging carts: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Fetch fresh user data
        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(user.getUserId());
        userDTO.setUserName(user.getUserName());
        userDTO.setEmail(user.getEmail());

        // ✅ FIX: Manually map Roles to Strings
        List<String> roleNames = user.getRoles().stream()
                .map(role -> role.getRoleName().name()) // Convert Enum to String
                .collect(Collectors.toList());
        userDTO.setRoles(roleNames);

        // Map Addresses
        List<AddressDTO> addressDTOs = user.getAddresses().stream().map(addr -> {
            AddressDTO dto = new AddressDTO();
            dto.setAddressId(addr.getAddressId());
            dto.setStreet(addr.getStreet());
            dto.setCity(addr.getCity());
            dto.setCountry(addr.getCountry());
            dto.setPincode(addr.getPincode());
            return dto;
        }).collect(Collectors.toList());

        userDTO.setAddresses(addressDTOs);

        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }
}