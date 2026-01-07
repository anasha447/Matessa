package com.ecommerce.matessa.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl; // ✅ Import 1
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit; // ✅ Import 2

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${project.image}")
    private String path;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Logic: When URL matches "/images/**" -> Go look in the physical directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + path + "/")
                // ✅ ADDED: Tell browser to cache this for 365 days
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
    }
}