import React from 'react';
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GameTopUp</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Platform top-up game terpercaya dengan harga terbaik dan proses tercepat. 
              Nikmati pengalaman gaming yang lebih seru dengan layanan kami.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">support@gametopup.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">Products</a></li>
              <li><a href="/transaction-check" className="hover:text-white transition-colors">Check Transaction</a></li>
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Popular Games */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Popular Games</h3>
            <ul className="space-y-2">
              <li><a href="/products?category=moba" className="hover:text-white transition-colors">Mobile Legends</a></li>
              <li><a href="/products?category=battle_royale" className="hover:text-white transition-colors">Free Fire</a></li>
              <li><a href="/products?category=battle_royale" className="hover:text-white transition-colors">PUBG Mobile</a></li>
              <li><a href="/products?category=rpg" className="hover:text-white transition-colors">Genshin Impact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 GameTopUp. All rights reserved. | Powered by Digiflazz API
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;