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
      <div className="container mx-auto px-4 py-24 flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
          <ShoppingBag className="h-16 w-16 text-[var(--muted)]" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-[var(--text)]">Your cart is empty</h2>
        <p className="text-[var(--muted)] mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
        </p>

        <Link
          to="/products"
          className="rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-semibold text-white transition hover:bg-opacity-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-[var(--text)]">Shopping Cart</h1>

      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="flex-1">
          <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="grid grid-cols-12 gap-4 p-6 border-b bg-[var(--surface-strong)] text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 text-right"></div>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-12 gap-4 p-6 items-center">
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-semibold text-[var(--text)] line-clamp-2 hover:text-[var(--accent)] transition-colors"
                      >
                        {item.name}
                      </Link>
                    </div>
                  </div>

                  <div className="col-span-2 text-center font-medium text-[var(--text)]">${item.price.toFixed(2)}</div>

                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)]">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                        }
                        className="h-12 w-12 text-lg font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
                      >
                        -
                      </button>
                      <span className="h-12 min-w-[56px] flex items-center justify-center border-x border-[var(--border)] text-base font-semibold text-[var(--text)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-12 w-12 text-lg font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 p-6 bg-[var(--surface-strong)] sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={clearCart}
                className="text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                Clear cart
              </button>
              <Link
                to="/products"
                className="text-sm font-semibold text-[var(--accent)] transition hover:text-opacity-90"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:w-96">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] sticky top-8">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--text)]">${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium text-[var(--text)]">${(totalPrice() * 0.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-[var(--text)]">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-extrabold">${(totalPrice() * 1.08).toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full rounded-3xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-opacity-95"
            >
              {user ? "Proceed to Checkout" : "Sign in to Checkout"}
              <ArrowRight className="ml-2 inline-block h-5 w-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
              <ShieldCheck className="h-4 w-4" />
              Secure Checkout Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
