package com.ecommerce.matessa.payLoad;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

private List<ProductDTO> content;
private int pageNumber;
private int pageSize;
private int totalPages;
private long totalElements;
private  boolean lastPage;
}
