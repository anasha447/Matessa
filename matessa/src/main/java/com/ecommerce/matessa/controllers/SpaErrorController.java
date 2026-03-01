package com.ecommerce.matessa.controllers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaErrorController implements ErrorController {

    // Forward any 404 errors to the frontend (index.html)
    // This allows React Router to handle the URL
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }
}