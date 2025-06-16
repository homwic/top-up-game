import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../../types';
import { apiService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Search, 
  Filter,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

const AdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!apiService.isAdminAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadTransactions();
  }, [navigate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, statusFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions();
      if (response.success && response.data) {
        // Sort by newest first
        const sortedTransactions = response.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.userPhone.includes(searchQuery) ||
        transaction.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.gameId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
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

  const exportTransactions = () => {
    // Simple CSV export
    const headers = ['ID', 'Tanggal', 'Pembeli', 'Produk', 'Jumlah', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.id,
        formatDate(t.createdAt),
        t.userName,
        t.productName,
        t.amount,
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
            <p className="text-gray-600 mt-2">Monitor dan kelola semua transaksi</p>
          </div>
          
          <button
            onClick={exportTransactions}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari ID transaksi, nama, HP, atau produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Diproses</option>
                <option value="success">Berhasil</option>
                <option value="failed">Gagal</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              {filteredTransactions.length} dari {transactions.length} transaksi
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembeli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                        <div className="text-sm text-gray-500">{transaction.userPhone}</div>
                        {transaction.userEmail && (
                          <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.productName}</div>
                      <div className="text-sm text-gray-500">Game ID: {transaction.gameId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {getStatusText(transaction.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(transaction.createdAt)}</div>
                      {transaction.updatedAt !== transaction.createdAt && (
                        <div className="text-xs text-gray-400">
                          Update: {formatDate(transaction.updatedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
              </h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Transaksi akan muncul di sini setelah ada pembelian'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Transaksi</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusText(selectedTransaction.status)}
                  </span>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Transaksi</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono">{selectedTransaction.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dibuat:</span>
                        <span>{formatDate(selectedTransaction.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Update:</span>
                        <span>{formatDate(selectedTransaction.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pembayaran:</span>
                        <span className="capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      {selectedTransaction.referenceId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Referensi:</span>
                          <span className="font-mono text-xs">{selectedTransaction.referenceId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pembeli</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span>{selectedTransaction.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">HP:</span>
                        <span>{selectedTransaction.userPhone}</span>
                      </div>
                      {selectedTransaction.userEmail && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span>{selectedTransaction.userEmail}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Game ID:</span>
                        <span>{selectedTransaction.gameId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Produk</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {selectedTransaction.productName}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedTransaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;