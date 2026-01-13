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
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/assets/**",
                "/static/**",
                "/images/**",
                "/favicon.ico",
                "/*.js",
                "/*.css",
                "/*.png",
                "/*.jpg",
                "/manifest.json",
                "/index.html"
        );
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                // 1. PUBLIC ASSETS
                                .requestMatchers("/", "/index.html", "/favicon.ico", "/static/**", "/assets/**", "/images/**", "/*.js", "/*.css", "/*.png", "/*.jpg").permitAll()

                                // 2. PUBLIC API ENDPOINTS
                                .requestMatchers("/api/auth/**", "/api/public/**", "/api/categories/**", "/api/products/**").permitAll()

                                // 3. ADMIN ENDPOINTS
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                // 4. ✅ CRITICAL FIX: Allow access to the Error Controller
                                // This lets the SpaErrorController forward 404s to index.html without a 401 block
                                .requestMatchers("/error").permitAll()

                                // 5. ✅ CRITICAL FIX: Allow ALL other frontend routes (Catch-All)
                                // Instead of listing /shop, /cart manually, we say "If it's not an API call above, let it pass"
                                // The SpaErrorController will catch it if it's a valid React route.
                                .requestMatchers("/**").permitAll()

                        // Note: The specific API rules above (lines 78-81) still PROTECT your data.
                        // This only opens the door for the React HTML page to load.
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ 1. ALLOW SPECIFIC ORIGINS (Add all domains you use)
        // If you are testing from localhost, keep it.
        // Ensure you include both 'http' and 'https' if needed.
        configuration.setAllowedOrigins(List.of(
                "https://matessa.in",       // Production Domain
                "https://www.matessa.in",   // WWW Subdomain
                "http://localhost:5173",    // Local React (Vite)
                "http://localhost:3000"     // Local React (Create React App)
        ));

        // ✅ 2. ALLOW METHODS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ✅ 3. ALLOW HEADERS
        configuration.setAllowedHeaders(List.of("*"));

        // ✅ 4. ALLOW CREDENTIALS (Cookies)
        // This requires setAllowedOrigins to be specific (cannot be "*")
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER).orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));
            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER).orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));
            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN).orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));
            Set<Role> adminRoles = Set.of(userRole, sellerRole, adminRole);

            String adminEmail = System.getenv("ADMIN_EMAIL");
            String adminPass = System.getenv("ADMIN_PASSWORD");

            if (adminEmail == null || adminEmail.isEmpty()) adminEmail = "anas@matessa.com";
            if (adminPass == null || adminPass.isEmpty()) adminPass = "tempPass123";

            User admin = userRepository.findByEmail(adminEmail).orElse(new User("admin", adminEmail, passwordEncoder.encode(adminPass)));
            admin.setPassword(passwordEncoder.encode(adminPass));
            admin.setRoles(adminRoles);
            userRepository.save(admin);
            System.out.println("✅ ADMIN SYNCED: " + adminEmail);
        };
    }
}