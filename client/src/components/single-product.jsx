import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

export default function SingleProduct({ product }) {
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // TODO: integrate with cart context / Redux
    console.log("Added to cart:", product);
  };

  const handleBuyNow = () => {
    // Add product to cart + go to checkout
    console.log("Buying now:", product);
    navigate("/checkout", { state: { product } });
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex justify-center items-center p-6">
      <div className="max-w-3xl bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-2 gap-6">
        {/* Product Image */}
        <div className="flex justify-center">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full max-w-sm rounded-xl shadow-md"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#212121] mb-4">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">{product.description}</p>
            <p className="text-2xl font-semibold text-[#4CAF50] mb-4">
              ₹{product.price}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              className="bg-[#FFC107] text-black hover:bg-[#e0a800] rounded-xl px-6 py-3 text-lg font-semibold transition duration-200"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              className="bg-[#4CAF50] text-white hover:bg-[#388E3C] rounded-xl px-6 py-3 text-lg font-semibold transition duration-200"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
