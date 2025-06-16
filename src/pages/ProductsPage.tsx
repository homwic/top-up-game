import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product, GameCategory } from '../types';
import { apiService } from '../services/api';
import ProductCard from '../components/UI/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Search, Filter, Grid, List, Star, RefreshCw } from 'lucide-react';

const gameCategories = [
  { id: 'all' as GameCategory, name: 'Semua Game' },
  { id: 'moba' as GameCategory, name: 'MOBA' },
  { id: 'battle_royale' as GameCategory, name: 'Battle Royale' },
  { id: 'rpg' as GameCategory, name: 'RPG' },
  { id: 'fps' as GameCategory, name: 'FPS' },
  { id: 'racing' as GameCategory, name: 'Racing' },
  { id: 'sports' as GameCategory, name: 'Sports' },
];

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high' | 'popular'>('popular');

  useEffect(() => {
    const category = searchParams.get('category') as GameCategory || 'all';
    setSelectedCategory(category);
    loadProducts(category);
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const loadProducts = async (category?: GameCategory) => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(category === 'all' ? undefined : category);
      if (response.success && response.data) {
        setProducts(response.data);
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
      // Force refresh from API (this will try Digiflazz first if configured)
      const response = await apiService.getProducts(selectedCategory === 'all' ? undefined : selectedCategory);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some(variant => 
          variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.amount.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low':
        filtered.sort((a, b) => {
          const minPriceA = Math.min(...a.variants.map(v => v.price));
          const minPriceB = Math.min(...b.variants.map(v => v.price));
          return minPriceA - minPriceB;
        });
        break;
      case 'price_high':
        filtered.sort((a, b) => {
          const maxPriceA = Math.max(...a.variants.map(v => v.price));
          const maxPriceB = Math.max(...b.variants.map(v => v.price));
          return maxPriceB - maxPriceA;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          const maxPriceA = Math.max(...a.variants.map(v => v.price));
          const maxPriceB = Math.max(...b.variants.map(v => v.price));
          return maxPriceB - maxPriceA;
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category: GameCategory) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produk Game</h1>
              <p className="text-gray-600 mt-1">
                Temukan produk top-up untuk game favoritmu
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={refreshProducts}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh produk"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Memuat...' : 'Refresh'}
              </button>

              {/* Search */}
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari game atau produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Kategori
                </h3>
                <div className="space-y-2">
                  {gameCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Urutkan</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popular">Terpopuler</option>
                  <option value="name">Nama A-Z</option>
                  <option value="price_low">Harga Terendah</option>
                  <option value="price_high">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Menampilkan {filteredProducts.length} produk
                {products.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    • Total {products.reduce((sum, p) => sum + p.variants.length, 0)} varian
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <ProductCard
                      product={product}
                      className={viewMode === 'list' ? 'flex flex-row' : ''}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Tidak ada produk ditemukan' 
                    : 'Belum ada produk tersedia'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Admin sedang menyiapkan produk untuk Anda'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <button
                    onClick={refreshProducts}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Memuat...' : 'Coba Refresh'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;