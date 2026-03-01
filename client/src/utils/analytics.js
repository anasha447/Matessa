// ✅ 1. Standard Google Analytics Event Helper
export const trackEvent = (eventName, params = {}) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  } else {
    console.warn("GTM dataLayer not found");
  }
};

// ✅ 2. E-commerce: Add to Cart
export const trackAddToCart = (product) => {
  trackEvent("add_to_cart", {
    ecommerce: {
      currency: "INR",
      value: product.specialPrice || product.price,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          price: product.specialPrice || product.price,
          quantity: 1,
          item_category: product.category?.categoryName || "General",
        },
      ],
    },
  });
};

// ✅ 3. E-commerce: View Item (Product Page)
export const trackViewItem = (product) => {
  trackEvent("view_item", {
    ecommerce: {
      currency: "INR",
      value: product.specialPrice || product.price,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          price: product.specialPrice || product.price,
        },
      ],
    },
  });
};