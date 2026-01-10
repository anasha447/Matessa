package com.ecommerce.matessa.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // ✅ FIXED LOGIC:
    // This Regex matches any path (/**) where the specific segment
    // does NOT contain a dot ([^\\.]*).
    //
    // 1. /checkout -> No dot -> Matches -> Forwards to index.html -> React loads
    // 2. /index.html -> Has dot -> NO Match -> Spring serves the real file
    // 3. /image.png  -> Has dot -> NO Match -> Spring serves the real file

    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}