import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { signInWithGoogle } from "../firebase";

export const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    navigate("/checkout");
  };


  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-gray-400"/>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight mb-4">
          Your cart is empty
        </h2>

        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our
          products and find something you love.
        </p>

        <Link
          to="/products"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold transition-colors shadow-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-6 border-b bg-gray-50 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 text-right"></div>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-12 gap-4 p-6 items-center">
                 
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-bold text-lg hover:text-purple-600 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                    </div>
                  </div>

                  <div className="col-span-2 text-center font-medium">
                    ${item.price.toFixed(2)}
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                    
                      <button onClick={() =>
                          updateQuantity(
                            item.productId,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                      </button>

                      <span className="px-3 py-1 font-medium min-w-10 text-center border-x">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="h-5 w-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                Clear Cart
              </button>
             
              <Link
                to="/products"
                className="text-sm font-medium text-purple-600 hover:underline">
                Continue Shopping
              </Link>

            </div>
          </div>
        </div>

        <div className="lg:w-96">
          <div className="bg-white border rounded-2xl p-8 shadow-sm sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${totalPrice().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium text-gray-900">
                  ${(totalPrice() * 0.08).toFixed(2)}
                </span>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-extrabold text-3xl">
                  ${(totalPrice() * 1.08).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {user ? "Proceed to Checkout" : "Sign in to Checkout"}
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Secure Checkout Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
