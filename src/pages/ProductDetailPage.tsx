import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/format';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { ArrowLeft, Star, Zap, Shield, Clock, ShoppingCart, Check, AlertCircle } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameId, setGameId] = useState('');
  const [serverId, setServerId] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ gameId?: string; serverId?: string; userPhone?: string }>({});

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
        // Select the first variant by default
        if (response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const validateGameId = (value: string): string | undefined => {
    if (!product?.gameIdConfig?.requiresGameId) return undefined;
    
    const config = product.gameIdConfig;
    
    if (!value.trim()) {
      return `${config.gameIdLabel} wajib diisi`;
    }
    
    if (config.gameIdMinLength && value.length < config.gameIdMinLength) {
      return `${config.gameIdLabel} minimal ${config.gameIdMinLength} karakter`;
    }
    
    if (config.gameIdMaxLength && value.length > config.gameIdMaxLength) {
      return `${config.gameIdLabel} maksimal ${config.gameIdMaxLength} karakter`;
    }
    
    if (config.gameIdFormat === 'numeric' && !/^\d+$/.test(value)) {
      return `${config.gameIdLabel} hanya boleh berisi angka`;
    }
    
    return undefined;
  };

  const validateServerId = (value: string): string | undefined => {
    if (!product?.gameIdConfig?.requiresServerId) return undefined;
    
    const config = product.gameIdConfig;
    
    if (!value.trim()) {
      return `${config.serverIdLabel} wajib diisi`;
    }
    
    if (config.serverIdMinLength && value.length < config.serverIdMinLength) {
      return `${config.serverIdLabel} minimal ${config.serverIdMinLength} karakter`;
    }
    
    if (config.serverIdMaxLength && value.length > config.serverIdMaxLength) {
      return `${config.serverIdLabel} maksimal ${config.serverIdMaxLength} karakter`;
    }
    
    if (config.serverIdFormat === 'numeric' && !/^\d+$/.test(value)) {
      return `${config.serverIdLabel} hanya boleh berisi angka`;
    }
    
    return undefined;
  };

  const validateUserPhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Nomor HP wajib diisi';
    }
    
    if (!/^08\d{8,12}$/.test(value)) {
      return 'Format nomor HP tidak valid (contoh: 081234567890)';
    }
    
    return undefined;
  };

  const handlePurchase = () => {
    const errors: { gameId?: string; serverId?: string; userPhone?: string } = {};
    
    // Validate all fields
    const gameIdError = validateGameId(gameId);
    const serverIdError = validateServerId(serverId);
    const userPhoneError = validateUserPhone(userPhone);
    
    if (gameIdError) errors.gameId = gameIdError;
    if (serverIdError) errors.serverId = serverIdError;
    if (userPhoneError) errors.userPhone = userPhoneError;
    
    setValidationErrors(errors);
    
    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!product || !selectedVariant) return;

    // Navigate to checkout with product and variant data
    navigate('/checkout', {
      state: {
        product,
        variant: selectedVariant,
        gameId: gameId.trim(),
        serverId: serverId.trim() || undefined,
        userPhone: userPhone.trim()
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali ke Produk
          </button>
        </div>
      </div>
    );
  }

  const gameIdConfig = product.gameIdConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image & Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl font-bold text-gray-400">{product.brand.charAt(0)}</div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                  {product.brand}
                </span>
                {product.isPopular && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-2 ml-2">
                    <Star className="w-3 h-3 inline mr-1" />
                    Popular
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              {/* Variant Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Nominal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{variant.amount}</div>
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(variant.price)}
                          </div>
                          {variant.originalPrice && variant.originalPrice > variant.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatCurrency(variant.originalPrice)}
                            </div>
                          )}
                        </div>
                        {selectedVariant?.id === variant.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      {variant.originalPrice && variant.originalPrice > variant.price && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                            <Zap className="w-3 h-3 mr-1" />
                            Hemat {Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Zap className="w-5 h-5" />, text: 'Proses Instan' },
                  { icon: <Shield className="w-5 h-5" />, text: '100% Aman' },
                  { icon: <Clock className="w-5 h-5" />, text: '24/7 Support' }
                ].map((feature, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600 mb-2 flex justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-sm text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Pembelian</h2>

              <form onSubmit={(e) => { e.preventDefault(); handlePurchase(); }} className="space-y-6">
                {/* Game ID */}
                {gameIdConfig?.requiresGameId && (
                  <div>
                    <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-2">
                      {gameIdConfig.gameIdLabel} *
                    </label>
                    <input
                      type="text"
                      id="gameId"
                      value={gameId}
                      onChange={(e) => {
                        setGameId(e.target.value);
                        if (validationErrors.gameId) {
                          setValidationErrors({ ...validationErrors, gameId: undefined });
                        }
                      }}
                      placeholder={gameIdConfig.gameIdPlaceholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.gameId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.gameId && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.gameId}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan {gameIdConfig.gameIdLabel} akun game Anda dengan benar
                    </p>
                  </div>
                )}

                {/* Server ID */}
                {gameIdConfig?.requiresServerId && (
                  <div>
                    <label htmlFor="serverId" className="block text-sm font-medium text-gray-700 mb-2">
                      {gameIdConfig.serverIdLabel} *
                    </label>
                    <input
                      type="text"
                      id="serverId"
                      value={serverId}
                      onChange={(e) => {
                        setServerId(e.target.value);
                        if (validationErrors.serverId) {
                          setValidationErrors({ ...validationErrors, serverId: undefined });
                        }
                      }}
                      placeholder={gameIdConfig.serverIdPlaceholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.serverId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.serverId && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.serverId}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan {gameIdConfig.serverIdLabel} sesuai dengan akun game Anda
                    </p>
                  </div>
                )}

                {/* Phone Number */}
                <div>
                  <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor HP (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    id="userPhone"
                    value={userPhone}
                    onChange={(e) => {
                      setUserPhone(e.target.value);
                      if (validationErrors.userPhone) {
                        setValidationErrors({ ...validationErrors, userPhone: undefined });
                      }
                    }}
                    placeholder="081234567890"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.userPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.userPhone && (
                    <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.userPhone}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Untuk konfirmasi dan notifikasi transaksi
                  </p>
                </div>

                {/* Order Summary */}
                {selectedVariant && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Produk:</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nominal:</span>
                        <span className="font-medium">{selectedVariant.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Game:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                      {gameIdConfig?.requiresGameId && gameId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{gameIdConfig.gameIdLabel}:</span>
                          <span className="font-medium">{gameId}</span>
                        </div>
                      )}
                      {gameIdConfig?.requiresServerId && serverId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{gameIdConfig.serverIdLabel}:</span>
                          <span className="font-medium">{serverId}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga:</span>
                        <span className="font-medium">{formatCurrency(selectedVariant.price)}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(selectedVariant.price)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  type="submit"
                  disabled={!selectedVariant}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Beli Sekarang
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;