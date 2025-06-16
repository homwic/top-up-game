import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigiflazzConfig } from '../../types';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Settings, 
  Key, 
  User, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  Clock,
  Database
} from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<DigiflazzConfig>({
    username: '',
    apiKey: '',
    isConfigured: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncInfo, setSyncInfo] = useState<{ lastSync: string | null; hasCache: boolean }>({ lastSync: null, hasCache: false });

  useEffect(() => {
    if (!apiService.isAdminAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadConfig();
    loadSyncInfo();
  }, [navigate]);

  const loadConfig = () => {
    const existingConfig = apiService.getDigiflazzConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  };

  const loadSyncInfo = () => {
    const info = apiService.getLastSyncInfo();
    setSyncInfo(info);
  };

  const handleSave = async () => {
    if (!config.username.trim() || !config.apiKey.trim()) {
      setMessage({ type: 'error', text: 'Username dan API Key harus diisi' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const newConfig: DigiflazzConfig = {
        ...config,
        username: config.username.trim(),
        apiKey: config.apiKey.trim(),
        isConfigured: true
      };

      apiService.setDigiflazzConfig(newConfig);
      setConfig(newConfig);
      setMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!config.isConfigured) {
      setMessage({ type: 'error', text: 'Simpan konfigurasi terlebih dahulu' });
      return;
    }

    try {
      setTesting(true);
      setMessage(null);

      const response = await apiService.fetchDigiflazzProducts();
      
      if (response.success) {
        setMessage({ type: 'success', text: `Koneksi berhasil! Ditemukan ${response.data?.length || 0} produk dari Digiflazz.` });
        loadSyncInfo(); // Refresh sync info
      } else {
        setMessage({ type: 'error', text: response.error || 'Gagal terhubung ke Digiflazz' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat testing koneksi' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan API</h1>
          <p className="text-gray-600 mt-2">Konfigurasi koneksi ke API Digiflazz untuk mengambil harga real-time</p>
        </div>

        {/* Sync Status */}
        {config.isConfigured && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Status Sinkronisasi</h3>
                <p className="text-gray-600">Informasi terakhir sinkronisasi dengan Digiflazz</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Terakhir Sync</div>
                  <div className="text-sm text-gray-600">
                    {syncInfo.lastSync ? formatDate(syncInfo.lastSync) : 'Belum pernah'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Database className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Cache Status</div>
                  <div className="text-sm text-gray-600">
                    {syncInfo.hasCache ? 'Data tersedia' : 'Tidak ada cache'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Konfigurasi Digiflazz</h2>
              <p className="text-gray-600">Masukkan kredensial API Digiflazz untuk mengambil harga real-time</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              config.isConfigured 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {config.isConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  API Terkonfigurasi - Harga akan diambil dari Digiflazz
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  API Belum Dikonfigurasi - Menggunakan harga mock
                </>
              )}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username Digiflazz
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="Masukkan username Digiflazz"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Username yang terdaftar di akun Digiflazz Anda
              </p>
            </div>

            {/* API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="apiKey"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Masukkan API Key Digiflazz"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                API Key dapat ditemukan di dashboard Digiflazz → Pengaturan → API
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || !config.username.trim() || !config.apiKey.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Konfigurasi
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !config.isConfigured}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {testing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <TestTube className="w-5 h-5" />
                    Test & Sync Data
                  </>
                )}
              </button>
            </div>
          </form>

          {/* API Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi API Digiflazz</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Endpoint:</span>
                <span className="font-mono text-gray-900">https://api.digiflazz.com/v1/price-list</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-mono text-gray-900">POST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-mono text-gray-900">JSON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Update Otomatis:</span>
                <span className="text-gray-900">Setiap kali sync produk</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Cara Mendapatkan API Key:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Login ke dashboard Digiflazz</li>
                <li>Masuk ke menu "Pengaturan" → "API"</li>
                <li>Copy username dan API key Anda</li>
                <li>Paste ke form di atas dan simpan</li>
                <li>Klik "Test & Sync Data" untuk mengambil harga terbaru</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Keuntungan Integrasi Real-time:</h4>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Harga selalu update sesuai Digiflazz</li>
                <li>Produk otomatis tersinkronisasi</li>
                <li>Stok dan status produk real-time</li>
                <li>Tidak perlu update manual</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;