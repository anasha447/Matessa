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
                        // ======================================================
                        // 1. STATIC ASSETS (Always Public)
                        // ======================================================
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico",
                                "/static/**", "/assets/**", "/images/**",
                                "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.json", "/*.svg"
                        ).permitAll()

                        // ======================================================
                        // 2. PUBLIC APIS (Explicitly Allowed)
                        // ======================================================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()

                        // If these are purely read-only public data, allow them:
                        .requestMatchers("/api/categories/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()

                        // ======================================================
                        // 3. SECURED APIS (Explicitly Locked)
                        // ======================================================
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Any other API call not listed above requires a Token
                        .requestMatchers("/api/**").authenticated()

                        // ======================================================
                        // 4. FRONTEND ROUTES (The Catch-All)
                        // ======================================================
                        // ⚡ MAGIC FIX: Allow EVERYTHING else.
                        // This lets React handle routing for /shop, /cart, /admin, /any-new-page
                        // without you ever needing to edit Java code again.
                        .anyRequest().permitAll()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins for simplicity
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
            // 1. Ensure Roles Exist
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));
            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));
            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));

            Set<Role> adminRoles = Set.of(userRole, sellerRole, adminRole);

            // 2. READ FROM ENVIRONMENT (Dokploy)
            String adminEmail = System.getenv("ADMIN_EMAIL");
            String adminPass = System.getenv("ADMIN_PASSWORD");

            // Safety Fallback (only if Env is missing)
            if (adminEmail == null || adminEmail.isEmpty()) adminEmail = "anas@matessa.com";
            if (adminPass == null || adminPass.isEmpty()) adminPass = "tempPass123";

            // 3. Find Admin OR Create New Object
            String finalEmail = adminEmail;
            User admin = userRepository.findByEmail(finalEmail)
                    .orElse(new User("admin", finalEmail, passwordEncoder.encode(adminPass)));

            // 4. FORCE UPDATE (Crucial Step)
            // Even if user exists, we OVERWRITE the password with the one from Dokploy
            admin.setPassword(passwordEncoder.encode(adminPass));
            admin.setRoles(adminRoles);

            userRepository.save(admin);

            System.out.println("✅ ADMIN SYNCED: " + finalEmail);
            System.out.println("🔑 Password active: " + adminPass);
        };
    }
}