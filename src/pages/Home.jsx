import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {ArrowRight,ShoppingBag,Star,ShieldCheck,Truck,}from "lucide-react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db, signInWithGoogle } from "../firebase";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const handleAddToCart = async (e, product) => {
    e.preventDefault(); // Prevent navigating to product detail
    if (!user) {
      toast.info("Please sign in to add items to your cart");
      try {
        const loggedInUser = await signInWithGoogle();
        if (!loggedInUser) return; // User cancelled
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-purple-500 to-purple-600 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Discover the Extraordinary
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-10 text-blue-100">
            Shop the latest trends, premium electronics, and everyday essentials
            all in one place.
          </p>
          <Link
            to="/products"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            Shop Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
            <p className="text-gray-600">
              On all orders over $50. Fast and reliable delivery.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Checkout</h3>
            <p className="text-gray-600">
              Your payment information is always safe and encrypted.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border">
            <div className="bg-yellow-100 p-4 rounded-full mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
            <p className="text-gray-600">
              We source only the best products from top brands.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">Handpicked items just for you.</p>
          </div>
          <Link
            to="/products"
            className="text-purple-600 font-medium hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse h-80 rounded-2xl"
              />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group block"
              >
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-purple-600 mb-1 uppercase tracking-wider">
                      {product.category}
                    </p>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xl">
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-gray-900 text-white p-2 rounded-full hover:bg-purple-600 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <p className="text-gray-500">
              No products found. Check back later!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
