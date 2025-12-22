package com.ecommerce.matessa.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductFlavorDTO {
    private Long flavorId;
    private String flavorName;      // e.g., "Lemon & Ginger"
    private Long targetProductId;   // ID to navigate to
    private String colorCode;       // e.g., "#F3CB57"
}