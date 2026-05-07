import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db, signInWithGoogle } from "../firebase";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner";
import { ProductCard } from "../components/ui/ProductCard";
import { FeatureCard } from "../components/ui/FeatureCard";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { user } = useUserStore();

  const handleAddToCart = async (product) => {
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
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`Added ${product.name} to cart`);
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), limit(4));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col bg-(--bg)">
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-(--accent)/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-(--accent-soft) px-4 py-2 text-sm font-semibold text-(--accent) mb-6">
            New arrivals · curated for a modern home
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-(--text) mb-6">
            A modern shopping experience with bold style and effortless checkout.
          </h1>
          <p className="max-w-2xl text-lg text-(--muted) mb-10 leading-relaxed">
            Discover premium finds, fast shipping, and a beautifully designed storefront built for comfort and clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-(--accent) px-8 py-4 text-base font-semibold text-white shadow-[0_20px_60px_-30px_rgba(124,58,237,0.9)] transition hover:-translate-y-0.5"
            >
              Shop featured products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface) px-8 py-4 text-base font-semibold text-(--text) transition hover:bg-(--surface-strong)"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={Truck}
            title="Fast delivery"
            accentClass="bg-indigo-100 text-indigo-600"
          >
            Free shipping on orders over $50 and fast, reliable delivery across the country.
          </FeatureCard>
          <FeatureCard
            icon={ShieldCheck}
            title="Safe checkout"
            accentClass="bg-violet-100 text-violet-600"
          >
            Your payment is protected with secure encryption and trusted checkout flow.
          </FeatureCard>
          <FeatureCard
            icon={Star}
            title="Curated selection"
            accentClass="bg-yellow-100 text-yellow-600"
          >
            We showcase premium products with thoughtful design and exceptional quality.
          </FeatureCard>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent) mb-2">
              Featured products
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-(--text)">
              Top picks for your cart.
            </h2>
            <p className="max-w-xl text-(--muted) mt-3 leading-relaxed">
              Every product is selected to bring style, comfort, and a little delight to your everyday routine.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-(--accent) font-semibold hover:underline"
          >
            Browse all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-(--surface) shadow-(--shadow) animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-(--border) bg-(--surface) p-16 text-center">
            <p className="text-(--muted)">No products found. Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
};
