import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Moon, Sun } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { signInWithGoogle, logout } from "../../firebase";
import { useTheme } from "../../contexts/ThemeContext";

export const Navbar = () => {
  const { totalItems, clearCart } = useCartStore();
  const { user, role } = useUserStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    clearCart();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-(--border) bg-(--surface)/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Package className="h-6 w-6 text-(--accent)" />
          <span className="text-2xl font-black tracking-tight text-(--text)">
            MEGA<span className="text-(--accent)">STORE</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="relative text-(--muted) hover:text-(--accent) transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-(--accent) text-white text-[0.65rem] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-(--text) transition hover:border-(--accent) hover:text-(--accent)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-(--muted) hover:text-(--accent)] transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">
                  {user.displayName?.split(" ")[0]}
                </span>
              </Link>
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-(--accent) hover:text-opacity-90 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-(--muted) hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-(--accent) hover:bg-opacity-95 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
