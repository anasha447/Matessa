package com.ecommerce.matessa.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${project.image}")
    private String path;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. External Images
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + path + "/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

        // 2. Index.html (Explicit caching rules)
        registry.addResourceHandler("/index.html")
                .addResourceLocations("classpath:/static/") // Points to the FOLDER, not the file
                .setCacheControl(CacheControl.noCache().noStore().mustRevalidate());

        // 3. All other static assets
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
    }
}