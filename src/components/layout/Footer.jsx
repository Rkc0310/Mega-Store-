import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t py-12 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} MegaStore. All rights reserved.</p>
        <p className="text-sm mt-2">Built with React, Tailwind CSS, and Firebase.</p>
      </div>
    </footer>
  );
};
