package com.ecommerce.matessa.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class CookieUtil {
    public static final String GUEST_COOKIE_NAME = "guest_session_id";

    public String getGuestSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (GUEST_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public String createGuestSessionId(HttpServletResponse response) {
        String sessionId = UUID.randomUUID().toString();
        Cookie cookie = new Cookie(GUEST_COOKIE_NAME, sessionId);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60); // 30 Days
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
        return sessionId;
    }

    public String getOrGenerateGuestId(HttpServletRequest request, HttpServletResponse response) {
        // 1. Try to get existing ID
        String sessionId = getGuestSessionId(request);

        // 2. If it doesn't exist, create a new one
        if (sessionId == null) {
            sessionId = createGuestSessionId(response);
        }

        return sessionId;
    }
    public void deleteGuestCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(GUEST_COOKIE_NAME, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 0 means "Delete Immediately"

        response.addCookie(cookie);
    }
}