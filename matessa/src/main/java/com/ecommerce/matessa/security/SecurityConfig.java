package com.ecommerce.matessa.security;

import com.ecommerce.matessa.models.AppRole;
import com.ecommerce.matessa.models.Role;
import com.ecommerce.matessa.models.User;
import com.ecommerce.matessa.repositories.RoleRepository;
import com.ecommerce.matessa.repositories.UserRepository;
import com.ecommerce.matessa.security.Services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // -----------------------------------------------------------
                        // 1. STATIC ASSETS (React Build Files)
                        // -----------------------------------------------------------
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/static/**",
                                "/assets/**",
                                "/*.ico",
                                "/*.json",
                                "/*.png",
                                "/*.jpg",
                                "/*.jpeg",
                                "/*.svg",
                                "/*.js",
                                "/*.css"
                        ).permitAll()

                        // -----------------------------------------------------------
                        // 2. PUBLIC API ENDPOINTS (Backend Data)
                        // -----------------------------------------------------------
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/categories/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/admin", "/admin/**").permitAll()
                        .anyRequest().authenticated()
                        // -----------------------------------------------------------
                        // 3. FRONTEND ROUTES (Must allow these so React handles them)
                        // -----------------------------------------------------------
                        .requestMatchers(
                                // Public Pages
                                "/shop",
                                "/what.is.mate",
                                "/our_story",
                                "/contact-us",
                                "/privacy-policy",
                                "/track-order",
                                "/product/**",  // Covers /product/123

                                // Auth Pages
                                "/login",
                                "/register",
                                "/resetpassword/**",

                                // Cart & Checkout
                                "/cart",
                                "/checkoutpage",

                                // User Pages (Allow React to load, then React checks login)
                                "/profile",
                                "/myorders",
                                "/order/**",
                                "/order-confirmation/**"
                        ).permitAll()

                        // -----------------------------------------------------------
                        // 4. SWAGGER UI (API Documentation)
                        // -----------------------------------------------------------
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // -----------------------------------------------------------
                        // 5. SECURE ADMIN ROUTES (Strictly Protected)
                        // -----------------------------------------------------------
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // -----------------------------------------------------------
                        // 6. DEFAULT: Everything else needs a token
                        // -----------------------------------------------------------
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins for simplicity (Update this for strict prod security later if needed)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Fetch or Create Roles
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));

            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));

            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));

            Set<Role> userRoles = Set.of(userRole);
            Set<Role> adminRoles = Set.of(userRole, sellerRole, adminRole);

            // 2. Create 'user1' (Test User)
            if (!userRepository.existsByUserName("user1")) {
                User user1 = new User("user1", "user1@example.com", passwordEncoder.encode("password123"));
                user1.setRoles(userRoles);
                userRepository.save(user1);
            }

            // 3. SECURE ADMIN CREATION
            String adminEmail = System.getenv("ADMIN_EMAIL");
            String adminPass = System.getenv("ADMIN_PASSWORD");

            if (adminEmail == null) adminEmail = "anas@matessa.com";
            if (adminPass == null) adminPass = "tempPass123";

            String finalEmail = adminEmail;
            String finalPass = adminPass;

            User admin = userRepository.findByUserName("admin")
                    .orElse(new User("admin", finalEmail, passwordEncoder.encode(finalPass)));

            admin.setEmail(finalEmail);
            admin.setPassword(passwordEncoder.encode(finalPass));
            admin.setRoles(adminRoles);

            userRepository.save(admin);
            System.out.println("✅ ADMIN USER READY. Email: " + finalEmail);
        };
    }
}