package com.ecommerce.matessa.services;

import com.ecommerce.matessa.configs.AppConstants;
import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.payLoad.*;
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
        Product productFromDb = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        productFromDb.setProductName(productDTO.getProductName());
        productFromDb.setDescription(productDTO.getDescription());
        productFromDb.setPrice(productDTO.getPrice());
        productFromDb.setDiscount(productDTO.getDiscount());
        productFromDb.setQuantity(productDTO.getQuantity());

        if (productFromDb.getPrice() != null && productFromDb.getDiscount() != null) {
            double specialPrice = productFromDb.getPrice() - ((productFromDb.getDiscount() * 0.01) * productFromDb.getPrice());
            productFromDb.setSpecialPrice(specialPrice);
        }

        productFromDb.getVariants().clear();
        productFromDb.getFlavors().clear();

        if (productDTO.getVariants() != null) {
            List<ProductVariant> newVariants = productDTO.getVariants().stream()
                    .map(v -> modelMapper.map(v, ProductVariant.class))
                    .collect(Collectors.toList());
            newVariants.forEach(v -> v.setProduct(productFromDb));
            productFromDb.getVariants().addAll(newVariants);
        }

        if (productDTO.getFlavors() != null) {
            List<ProductFlavor> newFlavors = productDTO.getFlavors().stream()
                    .map(f -> modelMapper.map(f, ProductFlavor.class))
                    .collect(Collectors.toList());
            newFlavors.forEach(f -> f.setProduct(productFromDb));
            productFromDb.getFlavors().addAll(newFlavors);
        }

        Product savedProduct = productRepository.save(productFromDb);

        List<Cart> carts = cartRepository.findCartsByProductId(productId);
        List<CartDTO> cartDTOs = carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
            List<ProductDTO> products = cart.getCartItems().stream()
                    .map(p -> modelMapper.map(p.getProduct(), ProductDTO.class)).collect(Collectors.toList());
            cartDTO.setProducts(products);
            return cartDTO;
        }).collect(Collectors.toList());
        cartDTOs.forEach(cart -> cartService.updateProductInCarts(cart.getCartId(), productId));

        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        Product productFromDb = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        List<Cart> carts = cartRepository.findCartsByProductId(productId);
        carts.forEach(cart -> cartService.deleteProductFromCart(cart.getCartId(), productId));

        productRepository.delete(productFromDb);
        return modelMapper.map(productFromDb, ProductDTO.class);
    }

    @Override
    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // ✅ FIX: Manually map Category ID
        ProductDTO dto = modelMapper.map(product, ProductDTO.class);
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
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