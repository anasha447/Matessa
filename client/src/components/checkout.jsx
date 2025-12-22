import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "../utils/imageUrl";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  if (!product) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-lg">No product selected.</p>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    console.log("Order placed:", product);
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex justify-center items-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#212121] mb-6">Checkout</h1>

        {/* Product summary */}
        <div className="flex items-center gap-6 border-b pb-4 mb-6">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">₹{product.price}</p>
          </div>
        </div>

        {/* Place order button */}
        <Button
          className="w-full bg-[#4CAF50] text-white hover:bg-[#388E3C] rounded-xl px-6 py-3 text-lg"
          onClick={handlePlaceOrder}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
