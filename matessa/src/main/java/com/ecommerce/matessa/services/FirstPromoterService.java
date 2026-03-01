package com.ecommerce.matessa.services;

import com.ecommerce.matessa.models.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirstPromoterService {

    private static final Logger logger = LoggerFactory.getLogger(FirstPromoterService.class);
    private static final String FP_URL = "https://v2.firstpromoter.com/api/v2/track/sale";

    @Value("${fp.api.key}")
    private String apiKey;

    @Value("${fp.account.id}")
    private String accountId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * @Async ensures this runs in the background.
     * The user won't wait for this API call to finish before seeing their confirmation page.
     */
    @Async
    public void trackSale(Order order, String userEmail) {
        try {
            // 1. Prepare Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Account-ID", accountId);

            // 2. Prepare Body
            // FirstPromoter expects amount in "cents" (smallest unit).
            // Example: ₹10.50 -> 1050
            int amountInCents = (int) (order.getTotalAmount() * 100);

            Map<String, Object> body = new HashMap<>();
            body.put("email", userEmail);
            body.put("event_id", String.valueOf(order.getOrderId())); // Unique Transaction ID
            body.put("amount", amountInCents);

            // Optional: Send the tracking ID (tid) if you stored it from the cookie
            // body.put("tid", order.getTrackingId());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            // 3. Send Request
            restTemplate.postForObject(FP_URL, request, String.class);
            logger.info("✅ FirstPromoter Sale Tracked for Order #{}", order.getOrderId());

        } catch (Exception e) {
            // We catch errors silently so the order process doesn't fail just because tracking failed
            logger.error("❌ Failed to track sale in FirstPromoter: {}", e.getMessage());
        }
    }
}