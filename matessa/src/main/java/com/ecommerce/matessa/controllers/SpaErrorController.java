package com.ecommerce.matessa.controllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            // ✅ IF 404 NOT FOUND:
            if (statusCode == HttpStatus.NOT_FOUND.value()) {

                // Get the URL the user tried to visit
                String originalUri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

                // 🛑 SAFETY: If it's a missing API call or missing Image, return real error
                if (originalUri != null) {
                    if (originalUri.startsWith("/api/") ||
                            originalUri.startsWith("/images/") ||
                            originalUri.endsWith(".js") ||
                            originalUri.endsWith(".css") ||
                            originalUri.endsWith(".png")) {
                        return "error";
                    }
                }

                // ✅ SUCCESS: It must be a React Route (like /checkout).
                // Serve index.html so React can load.
                return "forward:/index.html";
            }
        }
        return "error";
    }
}