import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { CheckCircle, Clock, Home, Search, Copy, Check } from 'lucide-react';

interface SuccessState {
  transaction: Transaction;
}

const TransactionSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SuccessState;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!state?.transaction) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.transaction) {
    return null;
  }

  const { transaction } = state;

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'processing':
        return <Clock className="w-16 h-16 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'success':
        return 'Transaksi Berhasil!';
      case 'processing':
        return 'Sedang Diproses...';
      default:
        return 'Menunggu Pembayaran';
    }
  };

  const getStatusDescription = () => {
    switch (transaction.status) {
      case 'success':
        return 'Top-up berhasil dilakukan dan item sudah masuk ke akun game Anda.';
      case 'processing':
        return 'Pembayaran Anda sedang diproses. Item akan masuk ke akun game dalam beberapa menit.';
      default:
        return 'Silakan lakukan pembayaran sesuai dengan metode yang dipilih.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getStatusText()}
          </h1>
          <p className="text-gray-600 mb-8">
            {getStatusDescription()}
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID Transaksi:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{transaction.id}</span>
                  <button
                    onClick={copyTransactionId}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy ID"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Produk:</span>
                <span className="font-medium">{transaction.productName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Game ID:</span>
                <span className="font-medium">{transaction.gameId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">{transaction.userName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nomor HP:</span>
                <span className="font-medium">{transaction.userPhone}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-medium capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bayar:</span>
                <span className="font-semibold text-lg text-blue-600">{formatCurrency(transaction.amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu:</span>
                <span className="font-medium">{formatDate(transaction.createdAt)}</span>
              </div>
              
              {transaction.referenceId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Referensi:</span>
                  <span className="font-mono text-sm">{transaction.referenceId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              transaction.status === 'success'
                ? 'bg-green-100 text-green-800'
                : transaction.status === 'processing'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              Status: {transaction.status === 'success' ? 'Berhasil' : 
                      transaction.status === 'processing' ? 'Diproses' : 'Pending'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
            
            <Link
              to="/transaction-check"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              <Search className="w-5 h-5" />
              Cek Transaksi Lain
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Simpan ID transaksi ini untuk referensi di masa mendatang. 
              Jika ada kendala, hubungi customer service kami dengan menyertakan ID transaksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccessPage;