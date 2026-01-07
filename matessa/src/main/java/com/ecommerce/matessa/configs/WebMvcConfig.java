package com.ecommerce.matessa.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // This reads "images/" from your application.properties
    @Value("${project.image}")
    private String path;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Logic: When URL matches "/images/**" -> Go look in the physical directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + path + "/");

    }
}