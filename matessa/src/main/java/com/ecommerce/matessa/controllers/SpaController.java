package com.ecommerce.matessa.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // ✅ FIXED: This Regex matches ANY path that does not contain a dot (.)
    // This allows /checkout, /order-confirmation/123, /profile, etc. automatically.
    // It ignores /main.js, /logo.png, etc. so they load correctly.
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}