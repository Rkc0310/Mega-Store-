import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {db,handleFirestoreError,OperationType,signInWithGoogle,}from "../firebase";
import { ShoppingBag, Search, Filter } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import { toast } from "sonner"; 

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { addItem } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "products");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            All Products
          </h1>
          <p className="text-gray-600">
            Browse our complete collection of premium items.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border rounded-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse h-80 rounded-2xl"
            />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group block"
            >
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col grow">
                  <p className="text-xs font-medium text-purple-600 mb-1 uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 grow">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-extrabold text-xl">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className="bg-gray-900 text-white p-2 rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-4 text-purple-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
