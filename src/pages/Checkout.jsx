import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!user) {
    navigate("/cart");
    return null;
  }

  if (items.length === 0 && !success) {
    navigate("/products");
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice() * 1.08, // Including tax
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderId(docRef.id);
      setSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "orders");
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          Thank you for your purchase, {user.displayName}.
        </p>
        <p className="text-gray-500 mb-8">
          Your order ID is{" "}
          <span className="font-mono font-bold text-gray-900">{orderId}</span>
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-100 hover:bg-blue-200 text-purple-800 px-8 py-3 rounded-full font-bold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center">
        Checkout
      </h1>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 border-b pb-4">
          Review Your Order
        </h2>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center py-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="font-bold line-clamp-1">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl mb-8">
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">
              ${totalPrice().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-4">
            <span>Tax (8%)</span>
            <span className="font-medium text-gray-900">
              ${(totalPrice() * 0.08).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-bold text-xl">Total</span>
            <span className="font-extrabold text-3xl text-purple-600">
              ${(totalPrice() * 1.08).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
};
