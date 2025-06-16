import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, GameCategory } from '../types';
import { apiService } from '../services/api';
import ProductCard from '../components/UI/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Gamepad2, Zap, Shield, Clock, Star, ArrowRight, TrendingUp, RefreshCw } from 'lucide-react';

const gameCategories = [
  { id: 'moba' as GameCategory, name: 'MOBA', icon: '⚔️', color: 'from-red-400 to-red-600' },
  { id: 'battle_royale' as GameCategory, name: 'Battle Royale', icon: '🔫', color: 'from-orange-400 to-orange-600' },
  { id: 'rpg' as GameCategory, name: 'RPG', icon: '🗡️', color: 'from-purple-400 to-purple-600' },
  { id: 'fps' as GameCategory, name: 'FPS', icon: '🎯', color: 'from-blue-400 to-blue-600' },
];

const HomePage: React.FC = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPopularProducts();
  }, []);

  const loadPopularProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.success && response.data) {
        console.log('Loaded products for homepage:', response.data.length);
        
        // Get popular products (marked as popular or first 6 products)
        let popular = response.data.filter(p => p.isPopular);
        
        // If no popular products, take first 6
        if (popular.length === 0) {
          popular = response.data.slice(0, 6);
        } else if (popular.length < 6) {
          // If less than 6 popular, add more products to reach 6
          const nonPopular = response.data.filter(p => !p.isPopular);
          popular = [...popular, ...nonPopular].slice(0, 6);
        } else {
          // If more than 6 popular, take first 6
          popular = popular.slice(0, 6);
        }
        
        setPopularProducts(popular);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      // Force refresh - this will check for synced products first
      await loadPopularProducts();
    } catch (error) {
      console.error('Failed to refresh products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Top-Up Game
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Tercepat & Terpercaya
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Nikmati pengalaman gaming terbaik dengan layanan top-up instan untuk semua game favoritmu. 
              Harga terjangkau, proses cepat, dan keamanan terjamin.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Gamepad2 className="w-5 h-5" />
              Mulai Top-Up Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Pilih GameTopUp?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami memberikan layanan terbaik untuk kebutuhan gaming Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Proses Instan',
                description: 'Top-up langsung masuk dalam hitungan detik',
                color: 'text-yellow-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: '100% Aman',
                description: 'Keamanan data dan transaksi terjamin',
                color: 'text-green-500'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: '24/7 Support',
                description: 'Layanan customer service sepanjang waktu',
                color: 'text-blue-500'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Harga Terbaik',
                description: 'Dapatkan harga termurah di pasaran',
                color: 'text-purple-500'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-100 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Game Populer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih kategori game favoritmu dan temukan produk top-up terbaik
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gameCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Produk Terpopuler</h2>
              <p className="text-gray-600">
                Produk top-up paling diminati oleh para gamers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshProducts}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh produk"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Memuat...' : 'Refresh'}
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}

          {!loading && popularProducts.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada produk tersedia</h3>
              <p className="text-gray-500 mb-4">
                Admin sedang menyiapkan produk untuk Anda. Silakan cek kembali nanti.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={refreshProducts}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Memuat...' : 'Coba Refresh'}
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Lihat Semua Produk
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Mulai Gaming?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabung dengan ribuan gamer yang sudah mempercayai layanan kami
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <Gamepad2 className="w-5 h-5" />
            Explore Produk
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;