import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, signInWithGoogle } from "../firebase";
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

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (e, product) => {
    e.preventDefault();

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text)] mb-2">All Products</h1>
          <p className="text-[var(--muted)]">Browse our complete collection of premium items.</p>
        </div>

        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-12 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-12 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] cursor-pointer"
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
            <div key={i} className="h-96 rounded-[32px] bg-[var(--surface)] shadow-[var(--shadow)] animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group block">
              <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_-30px_rgba(124,58,237,0.7)]">
                <div className="aspect-square overflow-hidden bg-[var(--input)]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/75 backdrop-blur-sm">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4 p-6 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)] mb-2">{product.category}</p>
                    <h3 className="text-lg font-semibold text-[var(--text)] line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <span className="text-xl font-extrabold text-[var(--text)]">${product.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:bg-opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-16 text-center">
          <p className="text-lg text-[var(--muted)]">No products found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-95"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
