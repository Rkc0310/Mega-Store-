import React from 'react';
import { Link} from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-(--surface) border-t border-(--border) py-12 mt-auto text-(--muted)">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
         <span className="text-2xl font-black tracking-tight text-(--text)">
            MEGA<span className="text-(--accent)">STORE</span>
          </span>
            <p className="max-w-md leading-relaxed">
              Modern shopping built to feel effortless, stylish, and refreshingly clear.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] mb-3 text-(--accent)">
              Quick links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>  
                 <Link to="/"
                   className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors">
                     Home </Link></li>

              <li>  
                <Link to="/products"  
                   className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors">
                     Products </Link></li>

              <li>
                 <Link to="/cart"
                   className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors">
                     Cart </Link></li>

              <li><Link to="/profile"
                  className="text-sm font-medium text-(--muted) hover:text-(--accent) transition-colors">
                    Profile </Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] mb-3 text-(--accent)">
              Stay connected
            </h4>
            <p className="text-sm leading-relaxed">
              Questions? Reach out anytime and we’ll help you shop with confidence.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-(--border) pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} MegaStore. Built with React, Tailwind, and Firebase.
        </div>
      </div>
    </footer>
  );
};
