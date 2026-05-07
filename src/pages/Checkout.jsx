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
        totalAmount: totalPrice() * 1.08,
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
      <div className="container mx-auto px-4 py-24 flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[var(--shadow)]">
          <CheckCircle className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[var(--text)]">Order confirmed!</h1>
        <p className="text-lg text-[var(--muted)] mb-2">Thank you for your purchase, {user.displayName}.</p>
        <p className="text-[var(--muted)] mb-8">
          Your order ID is <span className="font-mono font-semibold text-[var(--text)]">{orderId}</span>
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/profile")}
            className="rounded-full bg-[var(--surface)] px-8 py-4 text-sm font-semibold text-[var(--text)] shadow-[var(--shadow)] transition hover:bg-[var(--surface-strong)]"
          >
            View orders
          </button>
          <button
            onClick={() => navigate("/products")}
            className="rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-semibold text-white transition hover:bg-opacity-90"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center text-[var(--text)]">Checkout</h1>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-semibold mb-6 border-b border-[var(--border)] pb-4 text-[var(--text)]">
          Review your order
        </h2>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-3xl bg-[var(--input)]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)] line-clamp-1">{item.name}</p>
                  <p className="text-sm text-[var(--muted)]">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="font-semibold text-[var(--text)]">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 mb-8">
          <div className="flex justify-between text-[var(--muted)] mb-2">
            <span>Subtotal</span>
            <span className="font-medium text-[var(--text)]">${totalPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[var(--muted)] mb-2">
            <span>Shipping</span>
            <span className="font-medium text-emerald-600">Free</span>
          </div>
          <div className="flex justify-between text-[var(--muted)] mb-4">
            <span>Tax (8%)</span>
            <span className="font-medium text-[var(--text)]">${(totalPrice() * 0.08).toFixed(2)}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center text-[var(--text)]">
            <span className="font-semibold text-lg">Total</span>
            <span className="text-3xl font-extrabold text-[var(--accent)]">${(totalPrice() * 1.08).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full rounded-3xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </span>
          ) : (
            "Place order"
          )}
        </button>
      </div>
    </div>
  );
};
