import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import {db,handleFirestoreError,OperationType,signInWithGoogle,} from "../firebase";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore";
import {ArrowLeft,ShoppingCart,ShieldCheck,Truck,RefreshCw,} from "lucide-react";
import { toast } from "sonner"; //for popup message

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
        if (!loggedInUser) return; // User cancelled
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-purple-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="bg-gray-50 rounded-3xl overflow-hidden border">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto object-cover aspect-square"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-bold text-purple-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-4">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-gray-900 mb-6">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="font-medium mr-4">Status:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-medium min-w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-8 mt-auto">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <Truck className="h-6 w-6 text-gray-700 mb-2" />
              <span className="text-sm font-medium">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <RefreshCw className="h-6 w-6 text-gray-700 mb-2" />
              <span className="text-sm font-medium">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-gray-700 mb-2" />
              <span className="text-sm font-medium">2 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
