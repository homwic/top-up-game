import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, ShoppingCart, User, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null; // Admin has its own header
  }

  return (
    <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GameTopUp</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Products
            </Link>
            <Link
              to="/transaction-check"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Check Transaction
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <User className="h-5 w-5" />
            </button>
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;