import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, PaymentMethod, Transaction } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatPhoneNumber } from '../utils/format';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { ArrowLeft, CreditCard, Smartphone, Building2, CheckCircle } from 'lucide-react';

interface CheckoutState {
  product: Product;
  variant: ProductVariant;
  gameId: string;
  serverId?: string;
  userPhone: string;
}

const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode; fee: number }[] = [
  { id: 'ovo', name: 'OVO', icon: <Smartphone className="w-5 h-5" />, fee: 0 },
  { id: 'dana', name: 'DANA', icon: <Smartphone className="w-5 h-5" />, fee: 0 },
  { id: 'gopay', name: 'GoPay', icon: <Smartphone className="w-5 h-5" />, fee: 0 },
  { id: 'bank_transfer', name: 'Transfer Bank', icon: <Building2 className="w-5 h-5" />, fee: 2500 },
  { id: 'credit_card', name: 'Kartu Kredit', icon: <CreditCard className="w-5 h-5" />, fee: 3000 },
];

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('ovo');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!state?.product || !state?.variant) {
    navigate('/products');
    return null;
  }

  const { product, variant, gameId, serverId, userPhone } = state;
  const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment)!;
  const totalAmount = variant.price + selectedPaymentMethod.fee;

  const handleCheckout = async () => {
    if (!userName.trim()) {
      alert('Mohon isi nama lengkap');
      return;
    }

    try {
      setLoading(true);

      const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: `user-${Date.now()}`,
        userName: userName.trim(),
        userEmail: userEmail.trim() || undefined,
        userPhone: userPhone,
        gameId: gameId,
        serverId: serverId,
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.amount,
        amount: totalAmount,
        paymentMethod: selectedPayment,
        status: 'pending',
        referenceId: `REF-${Date.now()}`
      };

      const response = await apiService.createTransaction(transactionData);

      if (response.success && response.data) {
        navigate('/transaction/success', {
          state: { transaction: response.data }
        });
      } else {
        alert('Gagal membuat transaksi. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const gameIdConfig = product.gameIdConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Pesanan</h2>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  <p className="text-sm text-blue-600 font-medium">{variant.amount}</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(variant.price)}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {gameIdConfig?.requiresGameId && (
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
                  <span className="text-gray-600">Nomor HP:</span>
                  <span className="font-medium">{formatPhoneNumber(userPhone)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembeli</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-gray-600">{method.icon}</div>
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                    <div className="text-right">
                      {method.fee > 0 ? (
                        <span className="text-sm text-gray-600">+{formatCurrency(method.fee)}</span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">Gratis</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Produk:</span>
                  <span className="font-medium">{variant.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga:</span>
                  <span className="font-medium">{formatCurrency(variant.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Admin:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod.fee > 0 ? formatCurrency(selectedPaymentMethod.fee) : 'Gratis'}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Bayar:</span>
                  <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !userName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan melanjutkan pembayaran, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;