package com.ecommerce.matessa.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    // Forward all React routes to index.html
    @GetMapping({"/", "/shop", "/our_story", "/what.is.mate", "/cart","/admin",
            "/admin/**",  // Allows /admin/dashboard, /admin/users, etc.
            "/error", "/login","/signup", "/register", "/product/**"})
    public String forward() {
        return "forward:/index.html";
    }
}