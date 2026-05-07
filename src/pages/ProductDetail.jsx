import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, signInWithGoogle } from "../firebase";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Product not found");
          navigate("/products");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      toast.info("Please sign in to add items to your cart");
      try {
        const loggedInUser = await signInWithGoogle();
        if (!loggedInUser) return;
      } catch (error) {
        return;
      }
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shopping
      </button>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_minmax(380px,1fr)]">
        <div className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow)]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full object-cover aspect-square"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
            <span>{product.category}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-[var(--text)]">{product.name}</h1>
            <div className="text-4xl font-bold text-[var(--accent)]">${product.price.toFixed(2)}</div>
            <p className="text-[var(--muted)] text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-[var(--muted)]">Availability</span>
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-green-600' : 'bg-red-600'}`} />
                  {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex items-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-14 w-14 text-lg font-semibold text-[var(--text)] transition hover:bg-[var(--surface-soft)]"
                    >
                      -
                    </button>
                    <div className="flex h-14 min-w-[72px] items-center justify-center text-lg font-semibold text-[var(--text)] border-x border-[var(--border)]">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="h-14 w-14 text-lg font-semibold text-[var(--text)] transition hover:bg-[var(--surface-soft)]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="inline-flex min-h-[56px] items-center justify-center rounded-3xl bg-[var(--accent)] px-6 text-base font-semibold text-white transition hover:bg-opacity-90"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to cart
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)]">
              <Truck className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text)]">Free delivery</p>
            </div>
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)]">
              <RefreshCw className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text)]">30-day returns</p>
            </div>
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)]">
              <ShieldCheck className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text)]">Warranty support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
