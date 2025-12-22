package com.ecommerce.matessa.util;

import com.ecommerce.matessa.models.User;
import com.ecommerce.matessa.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    @Autowired
    UserRepository userRepository;

    private Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public String loggedInEmail() {
        Authentication authentication = getAuth();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user in context");
        }
        // Since we are now logging in via Email, we should fetch the user object to get the email safely
        return loggedInUser().getEmail();
    }

    public Long loggedInUserId() {
        return loggedInUser().getUserId();
    }

    public User loggedInUser() {
        Authentication authentication = getAuth();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user in context");
        }

        String principalName = authentication.getName();

        // 1. Try finding by Email (since we login with email now)
        return userRepository.findByEmail(principalName)
                // 2. Fallback: Try finding by Username (in case principal stores username)
                .or(() -> userRepository.findByUserName(principalName))
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with identifier: " + principalName));
    }
}