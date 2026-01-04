package com.ecommerce.matessa.services;

import com.ecommerce.matessa.configs.AppConstants;
import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.payLoad.*;
import com.ecommerce.matessa.repositories.CartItemRepository;
import com.ecommerce.matessa.repositories.CartRepository;
import com.ecommerce.matessa.repositories.CategoryRepository;
import com.ecommerce.matessa.repositories.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import  com.ecommerce.matessa.payLoad.ProductFlavorDTO;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Value("${project.image:images/}")
    private String path;

    // ==========================================
    // BASIC CRUD METHODS
    // ==========================================

    @Override
    @Transactional
    public ProductDTO addProduct(Long categoryId, ProductDTO productDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceExceptionHandler("Category", "categoryId", categoryId));

        boolean isProductNotExist = true;
        List<Product> products = category.getProducts();
        for (Product value : products) {
            if (value.getProductName().equalsIgnoreCase(productDTO.getProductName())) {
                isProductNotExist = false;
                break;
            }
        }

        if (!isProductNotExist) {
            throw new ApisExceptionHandler(productDTO.getProductName() + " already exist");
        }

        Product product = modelMapper.map(productDTO, Product.class);

        // Initialize list
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }

        product.setCategory(category);

        if (product.getPrice() != null && product.getDiscount() != null) {
            double specialPrice = product.getPrice() - ((product.getDiscount() * 0.01) * product.getPrice());
            product.setSpecialPrice(specialPrice);
        }

        // Link child entities
        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setProduct(product));
        }
        if (product.getFlavors() != null) {
            product.getFlavors().forEach(flavor -> flavor.setProduct(product));
        }

        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortDir) {
        int defaultPage = Integer.parseInt(AppConstants.PAGE_NUMBER);
        int defaultSize = Integer.parseInt(AppConstants.PAGE_SIZE);
        int page = (pageNumber == null || pageNumber < 1) ? defaultPage : pageNumber;
        int size = (pageSize == null || pageSize < 1) ? defaultSize : pageSize;
        String sortField = (sortBy == null || sortBy.isBlank()) ? AppConstants.SORT_PRODUCT_BY : sortBy;
        String direction = (sortDir == null || sortDir.isBlank()) ? AppConstants.SORT_DIR : sortDir;
        int pageIndex = Math.max(page - 1, 0);

        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(pageIndex, size, sort);

        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductDTO> productDTOS = productPage.getContent()
                .stream()
                .map(p -> {
                    // ✅ FIX: Manually map Category ID
                    ProductDTO dto = modelMapper.map(p, ProductDTO.class);
                    if (p.getCategory() != null) {
                        dto.setCategoryId(p.getCategory().getCategoryId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        if (productDTOS.isEmpty()) {
            throw new ApisExceptionHandler("No products found");
        }

        ProductResponse response = new ProductResponse();
        response.setContent(productDTOS);
        response.setPageNumber(productPage.getNumber() + 1);
        response.setPageSize(productPage.getSize());
        response.setTotalElements(productPage.getTotalElements());
        response.setTotalPages(productPage.getTotalPages());
        response.setLastPage(productPage.isLast());
        return response;
    }

    @Override
    public ProductResponse searchByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceExceptionHandler("Category", "categoryId", categoryId));

        List<Product> products = productRepository.findByCategoryOrderByPrice(category);
        List<ProductDTO> productDTOS = products.stream()
                .map(p -> {
                    // ✅ FIX: Manually map Category ID
                    ProductDTO dto = modelMapper.map(p, ProductDTO.class);
                    if (p.getCategory() != null) {
                        dto.setCategoryId(p.getCategory().getCategoryId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        if (productDTOS.isEmpty()) {
            throw new ApisExceptionHandler("No products found for category id: " + categoryId);
        }

        ProductResponse response = new ProductResponse();
        response.setContent(productDTOS);
        return response;
    }

    @Override
    public ProductResponse searchByKeywords(String keywords) {
        List<Product> products = productRepository.findByProductNameContainingIgnoreCase(keywords);
        List<ProductDTO> productDTOS = products.stream()
                .map(p -> {
                    // ✅ FIX: Manually map Category ID
                    ProductDTO dto = modelMapper.map(p, ProductDTO.class);
                    if (p.getCategory() != null) {
                        dto.setCategoryId(p.getCategory().getCategoryId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        if (productDTOS.isEmpty()) {
            throw new ApisExceptionHandler("No products found for keywords: " + keywords);
        }

        ProductResponse response = new ProductResponse();
        response.setContent(productDTOS);
        return response;
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long productId, ProductDTO productDTO) {
        // 1. Fetch existing product
        Product productFromDb = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // 2. Update Core Fields
        productFromDb.setProductName(productDTO.getProductName());
        productFromDb.setDescription(productDTO.getDescription());
        productFromDb.setPrice(productDTO.getPrice());
        productFromDb.setDiscount(productDTO.getDiscount());
        productFromDb.setQuantity(productDTO.getQuantity());

        // 3. Recalculate Special Price logic
        // (Using the values from DTO ensures we calculate based on the new price)
        double specialPrice = productDTO.getPrice() - ((productDTO.getDiscount() * 0.01) * productDTO.getPrice());
        productFromDb.setSpecialPrice(specialPrice);

        // 4. Save the product
        Product savedProduct = productRepository.save(productFromDb);

        // 5. Update price in all Carts that have this product
        // (This loop is much simpler than mapping DTOs unnecessarily)
        List<Cart> carts = cartRepository.findCartsByProductId(productId);

        carts.forEach(cart -> cartService.updateProductInCarts(cart.getCartId(), productId));

        // 6. Return DTO
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    @Transactional
    public ProductDTO deleteProduct(Long productId) {
        // 1. Find Product or throw exception
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // 2. REMOVE FROM ALL CARTS (Crucial Step)
        // This deletes every instance of this product (any variant) from cart_items table
        cartItemRepository.deleteByProductProductId(productId);

        // 3. Delete the Product from DB
        productRepository.delete(product);

        // 4. Return the deleted product data
        return modelMapper.map(product, ProductDTO.class);
    }

    @Override
    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        ProductDTO dto = modelMapper.map(product, ProductDTO.class);

        // ✅ Ensure Category ID is set
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
        }

        // ✅ Ensure Variants are mapped (ModelMapper usually does this, but manual check is safer)
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            List<ProductVariantDTO> variantDTOs = product.getVariants().stream()
                    .map(v -> modelMapper.map(v, ProductVariantDTO.class))
                    .collect(Collectors.toList());
            dto.setVariants(variantDTOs);
        }
        // 3. ✅ Map Flavors (This makes the buttons appear)
        if (product.getFlavors() != null && !product.getFlavors().isEmpty()) {
            List<ProductFlavorDTO> flavorDTOs = product.getFlavors().stream()
                    .map(f -> modelMapper.map(f, ProductFlavorDTO.class))
                    .collect(Collectors.toList());
            dto.setFlavors(flavorDTOs);
        }


        return dto;
    }

    // ==========================================
    // IMAGE METHODS (Implementing all 3 variations from Interface)
    // ==========================================

    @Override
    public ProductDTO uploadImageProduct(Long productId, MultipartFile image) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }

        // Limit check
        if (product.getImages().size() >= 5) {
            throw new ApisExceptionHandler("Product already has 5 images. Delete one to add new.");
        }

        // Upload
        String fileName = fileService.uploadImage(path, image);

        // Add to List
        product.getImages().add(fileName);

        Product updatedProduct = productRepository.save(product);
        return modelMapper.map(updatedProduct, ProductDTO.class);
    }

    @Override
    public ProductDTO updateImageProduct(Long productId, MultipartFile image) {
        return uploadImageProduct(productId, image);
    }

    @Override
    public Object updateProductImage(Long productId, MultipartFile image) throws IOException {
        return uploadImageProduct(productId, image);
    }

    @Override
    public ProductDTO deleteProductImage(Long productId, String fileName) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        if (product.getImages() != null && product.getImages().contains(fileName)) {
            product.getImages().remove(fileName);
        } else {
            throw new ApisExceptionHandler("Image not found in this product");
        }

        Product updatedProduct = productRepository.save(product);
        return modelMapper.map(updatedProduct, ProductDTO.class);
    }
}