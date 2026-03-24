import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { signInWithGoogle, logout } from "../../firebase";

export const Navbar = () => {
  const { totalItems, clearCart } = useCartStore();
  const { user, role } = useUserStore();

  const handleLogout = async () => {
    await logout();
    clearCart();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-xl tracking-tight">MegaStore</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            to="/home"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">
                  {user.displayName?.split(" ")[0]}
                </span>
              </Link>
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
