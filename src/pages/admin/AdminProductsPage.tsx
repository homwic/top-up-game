import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ProductVariant, GameIdConfig } from '../../types';
import { apiService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Plus, 
  Search, 
  Package, 
  Eye, 
  EyeOff,
  Star,
  RefreshCw,
  Edit,
  Save,
  X,
  DollarSign,
  TrendingUp,
  Database,
  CheckCircle,
  AlertTriangle,
  Settings,
  Gamepad2,
  Server,
  Image,
  Upload,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingVariant, setEditingVariant] = useState<{ productId: string; variantId: string; price: number } | null>(null);
  const [editingGameConfig, setEditingGameConfig] = useState<{ productId: string; config: GameIdConfig } | null>(null);
  const [editingImage, setEditingImage] = useState<{ productId: string; imageUrl: string } | null>(null);
  const [syncInfo, setSyncInfo] = useState<{ lastSync: string | null; hasCache: boolean }>({ lastSync: null, hasCache: false });
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    if (!apiService.isAdminAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadProducts();
    loadSyncInfo();
  }, [navigate]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use getProductsForAdmin to get all products without status filtering
      const response = await apiService.getProductsForAdmin();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncInfo = () => {
    const info = apiService.getLastSyncInfo();
    setSyncInfo(info);
  };

  const syncFromDigiflazz = async () => {
    try {
      setSyncing(true);
      const response = await apiService.fetchDigiflazzProducts();
      
      if (response.success && response.data) {
        // Reload products after sync
        await loadProducts();
        loadSyncInfo();
        alert(`Berhasil sinkronisasi ${response.data.length} produk dari Digiflazz!`);
      } else {
        alert(response.error || 'Gagal sinkronisasi produk');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Terjadi kesalahan saat sinkronisasi');
    } finally {
      setSyncing(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some(variant => 
          variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    setFilteredProducts(filtered);
  };

  const toggleProductStatus = (productId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' }
        : product
    );
    
    setProducts(updatedProducts);
    
    // Save status to API service
    const product = updatedProducts.find(p => p.id === productId);
    if (product) {
      apiService.updateProductStatus(productId, product.status);
      showSaveMessage(`Status produk ${product.name} berhasil diubah ke ${product.status === 'active' ? 'AKTIF' : 'NONAKTIF'}`);
    }
  };

  const toggleVariantStatus = (productId: string, variantId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.id === variantId
                ? { ...variant, status: variant.status === 'active' ? 'inactive' : 'active' }
                : variant
            )
          }
        : product
    );
    
    setProducts(updatedProducts);
    
    // Save status to API service
    const product = updatedProducts.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    if (variant) {
      apiService.updateVariantStatus(productId, variantId, variant.status);
      showSaveMessage(`Status varian ${variant.amount} berhasil diubah ke ${variant.status === 'active' ? 'AKTIF' : 'NONAKTIF'}`);
    }
  };

  const startEditPrice = (productId: string, variantId: string, currentPrice: number) => {
    setEditingVariant({ productId, variantId, price: currentPrice });
  };

  const savePrice = () => {
    if (!editingVariant) return;

    const updatedProducts = products.map(product => 
      product.id === editingVariant.productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.id === editingVariant.variantId
                ? { ...variant, price: editingVariant.price }
                : variant
            )
          }
        : product
    );

    setProducts(updatedProducts);
    
    // Save to API service (this will persist the price)
    apiService.saveCustomPrice(editingVariant.productId, editingVariant.variantId, editingVariant.price);
    
    // Find variant name for message
    const product = updatedProducts.find(p => p.id === editingVariant.productId);
    const variant = product?.variants.find(v => v.id === editingVariant.variantId);
    
    showSaveMessage(`Harga ${variant?.amount || 'varian'} berhasil disimpan: ${formatCurrency(editingVariant.price)}`);
    
    setEditingVariant(null);
  };

  const cancelEdit = () => {
    setEditingVariant(null);
  };

  const startEditGameConfig = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.gameIdConfig) {
      setEditingGameConfig({ 
        productId, 
        config: { ...product.gameIdConfig } 
      });
    } else {
      // Create default config
      setEditingGameConfig({
        productId,
        config: {
          requiresGameId: true,
          gameIdLabel: 'Game ID',
          gameIdPlaceholder: 'Masukkan Game ID',
          requiresServerId: false,
          gameIdFormat: 'alphanumeric',
          gameIdMinLength: 3,
          gameIdMaxLength: 20
        }
      });
    }
  };

  const saveGameConfig = () => {
    if (!editingGameConfig) return;

    const updatedProducts = products.map(product => 
      product.id === editingGameConfig.productId 
        ? { ...product, gameIdConfig: editingGameConfig.config }
        : product
    );

    setProducts(updatedProducts);
    
    // Save to API service
    apiService.saveGameIdConfig(editingGameConfig.productId, editingGameConfig.config);
    
    const product = updatedProducts.find(p => p.id === editingGameConfig.productId);
    showSaveMessage(`Konfigurasi Game ID untuk ${product?.name} berhasil disimpan`);
    
    setEditingGameConfig(null);
  };

  const cancelGameConfigEdit = () => {
    setEditingGameConfig(null);
  };

  const startEditImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setEditingImage({
      productId,
      imageUrl: product?.image || ''
    });
  };

  const saveImage = () => {
    if (!editingImage) return;

    const updatedProducts = products.map(product => 
      product.id === editingImage.productId 
        ? { ...product, image: editingImage.imageUrl }
        : product
    );

    setProducts(updatedProducts);
    
    // Save to API service
    apiService.saveProductImage(editingImage.productId, editingImage.imageUrl);
    
    const product = updatedProducts.find(p => p.id === editingImage.productId);
    showSaveMessage(`Gambar produk ${product?.name} berhasil disimpan`);
    
    setEditingImage(null);
  };

  const removeImage = () => {
    if (!editingImage) return;

    const updatedProducts = products.map(product => 
      product.id === editingImage.productId 
        ? { ...product, image: undefined }
        : product
    );

    setProducts(updatedProducts);
    
    // Save to API service (empty string to remove)
    apiService.saveProductImage(editingImage.productId, '');
    
    const product = updatedProducts.find(p => p.id === editingImage.productId);
    showSaveMessage(`Gambar produk ${product?.name} berhasil dihapus`);
    
    setEditingImage(null);
  };

  const cancelImageEdit = () => {
    setEditingImage(null);
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      moba: 'bg-red-100 text-red-800',
      battle_royale: 'bg-orange-100 text-orange-800',
      rpg: 'bg-purple-100 text-purple-800',
      fps: 'bg-blue-100 text-blue-800',
      racing: 'bg-green-100 text-green-800',
      sports: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk & Konfigurasi</h1>
            <p className="text-gray-600 mt-2">Kelola produk, harga, gambar, dan konfigurasi Game ID dari API Digiflazz</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={syncFromDigiflazz}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {syncing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync dari Digiflazz
            </button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{saveMessage}</p>
            </div>
          </div>
        )}

        {/* Status Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-semibold mb-1">Kontrol Produk & Konfigurasi</h4>
              <p className="text-yellow-700 text-sm">
                • <strong>Produk NONAKTIF</strong> = Tidak muncul di halaman user sama sekali<br />
                • <strong>Varian NONAKTIF</strong> = Hanya varian tersebut yang disembunyikan<br />
                • <strong>Konfigurasi Game ID</strong> = Atur field yang wajib diisi user (Game ID, Server ID)<br />
                • <strong>Gambar Produk</strong> = Upload atau masukkan URL gambar custom untuk setiap produk<br />
                • Semua perubahan tersimpan otomatis dan langsung berlaku untuk user
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        {syncInfo.lastSync && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Terakhir sync: {formatDate(syncInfo.lastSync)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Data produk, harga, gambar, dan konfigurasi dari Digiflazz API • Perubahan tersimpan otomatis
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                Real-time pricing
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk, brand, kode, atau varian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              Menampilkan {filteredProducts.length} produk
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Product Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">{product.brand.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                        {product.isPopular && (
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(product.category)}`}>
                          {product.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600">{product.brand} • {product.variants.length} varian</p>
                      
                      {/* Game ID Config Info */}
                      <div className="flex items-center gap-4 mt-2">
                        {product.gameIdConfig?.requiresGameId && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            <Gamepad2 className="w-3 h-3" />
                            {product.gameIdConfig.gameIdLabel}
                          </span>
                        )}
                        {product.gameIdConfig?.requiresServerId && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                            <Server className="w-3 h-3" />
                            {product.gameIdConfig.serverIdLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditImage(product.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                      title="Edit Gambar Produk"
                    >
                      <Image className="w-4 h-4" />
                      Gambar
                    </button>
                    <button
                      onClick={() => startEditGameConfig(product.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                      title="Konfigurasi Game ID"
                    >
                      <Settings className="w-4 h-4" />
                      Config
                    </button>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'active' ? 'AKTIF (Tampil di User)' : 'NONAKTIF (Disembunyikan)'}
                    </span>
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.status === 'active'
                          ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={product.status === 'active' ? 'Sembunyikan dari User' : 'Tampilkan ke User'}
                    >
                      {product.status === 'active' ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Varian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga Digiflazz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga Jual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant) => {
                      const isEditing = editingVariant?.productId === product.id && editingVariant?.variantId === variant.id;
                      const originalPrice = variant.originalPrice || variant.price * 0.9; // Assume 10% markup if no original price
                      const profit = variant.price - originalPrice;
                      const profitPercentage = ((profit / originalPrice) * 100);
                      
                      return (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{variant.amount}</div>
                              <div className="text-sm text-gray-500">{variant.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {variant.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(originalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editingVariant.price}
                                  onChange={(e) => setEditingVariant({
                                    ...editingVariant,
                                    price: parseInt(e.target.value) || 0
                                  })}
                                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      savePrice();
                                    } else if (e.key === 'Escape') {
                                      cancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={savePrice}
                                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                  title="Simpan (Enter)"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Batal (Esc)"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(variant.price)}
                                </span>
                                <button
                                  onClick={() => startEditPrice(product.id, variant.id, variant.price)}
                                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                  title="Edit Harga"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(profit)}
                              </div>
                              <div className={`text-xs ${profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variant.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.status === 'active' ? 'AKTIF' : 'NONAKTIF'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleVariantStatus(product.id, variant.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                variant.status === 'active'
                                  ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={variant.status === 'active' ? 'Sembunyikan Varian' : 'Tampilkan Varian'}
                            >
                              {variant.status === 'active' ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Tidak ada produk ditemukan' : 'Belum ada produk'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Coba ubah kata kunci pencarian Anda'
                : 'Sinkronisasi produk dari Digiflazz untuk memulai'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={syncFromDigiflazz}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {syncing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync dari Digiflazz
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Image Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Gambar Produk</h2>
                <button
                  onClick={cancelImageEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Gambar
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {editingImage.imageUrl ? (
                      <div className="text-center">
                        <img
                          src={editingImage.imageUrl}
                          alt="Preview"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'block';
                          }}
                        />
                        <div className="hidden text-red-500 text-sm">
                          Gagal memuat gambar. Periksa URL gambar.
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Belum ada gambar</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Gambar
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={editingImage.imageUrl}
                      onChange={(e) => setEditingImage({
                        ...editingImage,
                        imageUrl: e.target.value
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan URL gambar yang valid (JPG, PNG, WebP, dll.)
                  </p>
                </div>

                {/* Recommended Image Sources */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Sumber Gambar Rekomendasi:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Pexels:</strong> https://www.pexels.com (Gratis, berkualitas tinggi)</li>
                    <li>• <strong>Unsplash:</strong> https://unsplash.com (Gratis, profesional)</li>
                    <li>• <strong>Pixabay:</strong> https://pixabay.com (Gratis, beragam)</li>
                    <li>• <strong>Game Assets:</strong> Logo/artwork resmi dari developer game</li>
                  </ul>
                </div>

                {/* Image Guidelines */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Panduan Gambar:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Ukuran optimal: 300x300px atau lebih</li>
                    <li>• Format: JPG, PNG, WebP</li>
                    <li>• Rasio aspek: 1:1 (persegi) atau 16:9</li>
                    <li>• Pastikan gambar relevan dengan produk game</li>
                    <li>• Hindari gambar dengan watermark</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-6 border-t">
                  <button
                    onClick={removeImage}
                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Gambar
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={cancelImageEdit}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveImage}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Simpan Gambar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game ID Configuration Modal */}
      {editingGameConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Konfigurasi Game ID</h2>
                <button
                  onClick={cancelGameConfigEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Game ID
                    </label>
                    <input
                      type="text"
                      value={editingGameConfig.config.gameIdLabel}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, gameIdLabel: e.target.value }
                      })}
                      placeholder="contoh: User ID, Player ID, UID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder Game ID
                    </label>
                    <input
                      type="text"
                      value={editingGameConfig.config.gameIdPlaceholder}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, gameIdPlaceholder: e.target.value }
                      })}
                      placeholder="contoh: Masukkan User ID (123456789)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Game ID Format & Length */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format Game ID
                    </label>
                    <select
                      value={editingGameConfig.config.gameIdFormat}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, gameIdFormat: e.target.value as 'numeric' | 'alphanumeric' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="numeric">Hanya Angka</option>
                      <option value="alphanumeric">Angka & Huruf</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panjang Minimal
                    </label>
                    <input
                      type="number"
                      value={editingGameConfig.config.gameIdMinLength || ''}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, gameIdMinLength: parseInt(e.target.value) || undefined }
                      })}
                      placeholder="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panjang Maksimal
                    </label>
                    <input
                      type="number"
                      value={editingGameConfig.config.gameIdMaxLength || ''}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, gameIdMaxLength: parseInt(e.target.value) || undefined }
                      })}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Server ID Settings */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="requiresServerId"
                      checked={editingGameConfig.config.requiresServerId}
                      onChange={(e) => setEditingGameConfig({
                        ...editingGameConfig,
                        config: { ...editingGameConfig.config, requiresServerId: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresServerId" className="text-sm font-medium text-gray-700">
                      Memerlukan Server ID (Input Field)
                    </label>
                  </div>

                  {editingGameConfig.config.requiresServerId && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label Server ID
                          </label>
                          <input
                            type="text"
                            value={editingGameConfig.config.serverIdLabel || ''}
                            onChange={(e) => setEditingGameConfig({
                              ...editingGameConfig,
                              config: { ...editingGameConfig.config, serverIdLabel: e.target.value }
                            })}
                            placeholder="contoh: Server ID, Zone ID"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Placeholder Server ID
                          </label>
                          <input
                            type="text"
                            value={editingGameConfig.config.serverIdPlaceholder || ''}
                            onChange={(e) => setEditingGameConfig({
                              ...editingGameConfig,
                              config: { ...editingGameConfig.config, serverIdPlaceholder: e.target.value }
                            })}
                            placeholder="contoh: Masukkan Server ID (2001)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Server ID Format & Length */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format Server ID
                          </label>
                          <select
                            value={editingGameConfig.config.serverIdFormat || 'numeric'}
                            onChange={(e) => setEditingGameConfig({
                              ...editingGameConfig,
                              config: { ...editingGameConfig.config, serverIdFormat: e.target.value as 'numeric' | 'alphanumeric' }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="numeric">Hanya Angka</option>
                            <option value="alphanumeric">Angka & Huruf</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Panjang Minimal
                          </label>
                          <input
                            type="number"
                            value={editingGameConfig.config.serverIdMinLength || ''}
                            onChange={(e) => setEditingGameConfig({
                              ...editingGameConfig,
                              config: { ...editingGameConfig.config, serverIdMinLength: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Panjang Maksimal
                          </label>
                          <input
                            type="number"
                            value={editingGameConfig.config.serverIdMaxLength || ''}
                            onChange={(e) => setEditingGameConfig({
                              ...editingGameConfig,
                              config: { ...editingGameConfig.config, serverIdMaxLength: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={cancelGameConfigEdit}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveGameConfig}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;