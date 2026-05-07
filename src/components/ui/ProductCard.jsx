import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export const ProductCard = ({ product, onAddToCart }) => {
  const handleAdd = (event) => {
    event.preventDefault();
    onAddToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-[28px] border border-(--border) bg-(--surface) shadow-(--shadow) transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(124,58,237,0.7)]">
        <div className="aspect-square bg-(--input) overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-(--accent) mb-2">
            {product.category}
          </p>
          <h3 className="text-lg font-semibold text-(--text) mb-3 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-extrabold text-(--text)">
              ${product.price.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-(--accent) text-white transition hover:bg-opacity-95"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
