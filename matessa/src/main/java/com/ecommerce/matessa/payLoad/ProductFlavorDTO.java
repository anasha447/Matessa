package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductFlavorDTO {
    private Long flavorId;
    private String flavorName;      // e.g., "Lemon & Ginger"
    private Long targetProductId;   // Internal ID (kept for backward compat)
    private String targetSlug;      // ✅ NEW: slug for SEO-friendly navigation
    private String colorCode;       // e.g., "#F3CB57"
}