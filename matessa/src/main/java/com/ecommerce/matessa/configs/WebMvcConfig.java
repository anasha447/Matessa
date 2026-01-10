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
        // 1. EXTERNAL IMAGES (Uploads)
        // Keep caching these, they don't change often
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + path + "/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));

        // 2. ✅ CRITICAL FIX: INDEX.HTML (The Gatekeeper)
        // Force the browser to NEVER cache this file.
        // It must check the server every time to see if you deployed a new version.
        registry.addResourceHandler("/index.html")
                .addResourceLocations("classpath:/static/index.html")
                .setCacheControl(CacheControl.noCache().noStore().mustRevalidate());

        // 3. STATIC ASSETS (JS, CSS, Icons) - The rest of the React App
        // These files have hashed names (e.g., main.a8b2c9.js), so it is safe
        // and recommended to cache them forever.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
    }
}