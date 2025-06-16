import React, { useState } from 'react';
import { Transaction } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, Copy, Check } from 'lucide-react';

const TransactionCheckPage: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      setError('Mohon masukkan ID transaksi');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTransaction(null);

      const response = await apiService.getTransactionById(transactionId.trim());
      
      if (response.success && response.data) {
        setTransaction(response.data);
      } else {
        setError('Transaksi tidak ditemukan. Periksa kembali ID transaksi Anda.');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mencari transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return 'Berhasil';
      case 'processing':
        return 'Diproses';
      case 'failed':
        return 'Gagal';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const copyTransactionId = async () => {
    if (!transaction) return;
    
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cek Status Transaksi</h1>
          <p className="text-gray-600">
            Masukkan ID transaksi untuk melihat status dan detail pembelian Anda
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Masukkan ID transaksi (contoh: txn-123456)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !transactionId.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Cari
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Detail Transaksi</h2>
              <div className="flex items-center gap-2">
                {getStatusIcon(transaction.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Transaction Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Transaksi</h3>
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
                    <span className="text-gray-600">Waktu Pembelian:</span>
                    <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terakhir Update:</span>
                    <span className="font-medium">{formatDate(transaction.updatedAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metode Pembayaran:</span>
                    <span className="font-medium capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  
                  {transaction.referenceId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referensi:</span>
                      <span className="font-mono text-sm">{transaction.referenceId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product & User Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Produk & Pembeli</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produk:</span>
                    <span className="font-medium">{transaction.productName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Game ID:</span>
                    <span className="font-medium">{transaction.gameId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama Pembeli:</span>
                    <span className="font-medium">{transaction.userName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nomor HP:</span>
                    <span className="font-medium">{transaction.userPhone}</span>
                  </div>
                  
                  {transaction.userEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{transaction.userEmail}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Total Bayar:</span>
                    <span className="font-bold text-lg text-blue-600">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Description */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Status Transaksi</h4>
              <p className="text-sm text-gray-600">
                {transaction.status === 'success' && 
                  'Transaksi berhasil diselesaikan. Item sudah masuk ke akun game Anda.'}
                {transaction.status === 'processing' && 
                  'Transaksi sedang diproses. Mohon tunggu beberapa saat, item akan segera masuk ke akun game Anda.'}
                {transaction.status === 'pending' && 
                  'Menunggu pembayaran. Silakan lakukan pembayaran sesuai metode yang dipilih.'}
                {transaction.status === 'failed' && 
                  'Transaksi gagal diproses. Jika ada dana yang terpotong, akan dikembalikan dalam 1-3 hari kerja.'}
                {transaction.status === 'cancelled' && 
                  'Transaksi dibatalkan. Jika ada dana yang terpotong, akan dikembalikan dalam 1-3 hari kerja.'}
              </p>
            </div>

            {/* Contact Support */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Butuh Bantuan?</h4>
              <p className="text-sm text-blue-800">
                Jika ada kendala dengan transaksi ini, hubungi customer service kami di WhatsApp 
                <strong> +62 812-3456-7890</strong> dengan menyertakan ID transaksi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCheckPage;