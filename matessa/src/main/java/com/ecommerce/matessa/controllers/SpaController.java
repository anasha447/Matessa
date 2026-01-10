package com.ecommerce.matessa.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Match everything that hasn't been matched by other controllers or static files
    @RequestMapping(value = "/**")
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // 1. If it's an API call, let it fail naturally (404) if not found
        if (uri.startsWith("/api")) {
            return null;
        }

        // 2. If it looks like a static file (has a dot extension like .js, .png, .css), ignore it
        // This prevents infinite loops for missing images
        if (uri.contains(".")) {
            return null;
        }

        // 3. For everything else (React Routes like /checkout, /shop), forward to index.html
        return "forward:/index.html";
    }
}