import { Product, ProductVariant, Transaction, DigiflazzConfig, DigiflazzProduct, ApiResponse, GameIdConfig, ServerOption } from '../types';
import { generateDigiflazzSignature } from '../utils/crypto';
import mockProducts from '../data/mockProducts.json';
import mockTransactions from '../data/mockTransactions.json';

class ApiService {
  private digiflazzConfig: DigiflazzConfig | null = null;
  private readonly DIGIFLAZZ_API_URL = '/api/digiflazz/v1/price-list';

  constructor() {
    this.loadDigiflazzConfig();
  }

  // Digiflazz Configuration
  setDigiflazzConfig(config: DigiflazzConfig): void {
    this.digiflazzConfig = config;
    localStorage.setItem('digiflazz_config', JSON.stringify(config));
  }

  private loadDigiflazzConfig(): void {
    const stored = localStorage.getItem('digiflazz_config');
    if (stored) {
      this.digiflazzConfig = JSON.parse(stored);
    }
  }

  getDigiflazzConfig(): DigiflazzConfig | null {
    return this.digiflazzConfig;
  }

  // Product Image Management
  saveProductImage(productId: string, imageUrl: string): void {
    const customImages = this.getCustomImages();
    customImages[productId] = imageUrl;
    customImages.timestamp = new Date().toISOString();
    
    localStorage.setItem('custom_images', JSON.stringify(customImages));
    console.log(`Saved custom image for ${productId}:`, imageUrl);
  }

  private getCustomImages(): Record<string, any> {
    const stored = localStorage.getItem('custom_images');
    return stored ? JSON.parse(stored) : {};
  }

  // Game ID Configuration Management
  saveGameIdConfig(productId: string, config: GameIdConfig): void {
    const gameIdConfigs = this.getGameIdConfigs();
    gameIdConfigs[productId] = config;
    gameIdConfigs.timestamp = new Date().toISOString();
    
    localStorage.setItem('game_id_configs', JSON.stringify(gameIdConfigs));
    console.log(`Saved game ID config for ${productId}:`, config);
  }

  private getGameIdConfigs(): Record<string, any> {
    const stored = localStorage.getItem('game_id_configs');
    return stored ? JSON.parse(stored) : {};
  }

  // Products
  async getProducts(category?: string): Promise<ApiResponse<Product[]>> {
    try {
      // First, try to get synced products from localStorage
      const syncedProducts = localStorage.getItem('digiflazz_products');
      
      if (syncedProducts) {
        console.log('Using synced Digiflazz products from localStorage');
        let products = JSON.parse(syncedProducts) as Product[];
        
        // Apply custom configurations
        products = this.applyCustomConfigurations(products);
        
        // Apply status filtering for user pages
        products = this.applyStatusFiltering(products);
        
        if (category && category !== 'all') {
          products = products.filter(p => p.category === category);
        }
        
        return {
          success: true,
          data: products
        };
      }

      // If no synced products and Digiflazz is configured, try to fetch
      if (this.digiflazzConfig?.isConfigured) {
        console.log('No synced products found, trying to fetch from Digiflazz...');
        const digiflazzResponse = await this.fetchDigiflazzProducts();
        if (digiflazzResponse.success && digiflazzResponse.data) {
          let products = digiflazzResponse.data;
          
          // Apply custom configurations
          products = this.applyCustomConfigurations(products);
          
          // Apply status filtering for user pages
          products = this.applyStatusFiltering(products);
          
          if (category && category !== 'all') {
            products = products.filter(p => p.category === category);
          }
          
          return {
            success: true,
            data: products
          };
        }
        // If Digiflazz fails, log the error but continue with mock data
        console.warn('Digiflazz API failed, using mock data:', digiflazzResponse.error);
      }

      // Fallback to mock data
      console.log('Using mock data as fallback');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let products = [...mockProducts] as Product[];
      
      // Apply custom configurations even to mock data
      products = this.applyCustomConfigurations(products);
      
      // Apply status filtering for user pages
      products = this.applyStatusFiltering(products);
      
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }

      return {
        success: true,
        data: products
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      return {
        success: false,
        error: 'Failed to fetch products'
      };
    }
  }

  // Get products for admin (without status filtering)
  async getProductsForAdmin(category?: string): Promise<ApiResponse<Product[]>> {
    try {
      // First, try to get synced products from localStorage
      const syncedProducts = localStorage.getItem('digiflazz_products');
      
      if (syncedProducts) {
        console.log('Using synced Digiflazz products from localStorage (Admin)');
        let products = JSON.parse(syncedProducts) as Product[];
        
        // Apply custom configurations but NO status filtering for admin
        products = this.applyCustomConfigurations(products);
        
        if (category && category !== 'all') {
          products = products.filter(p => p.category === category);
        }
        
        return {
          success: true,
          data: products
        };
      }

      // If no synced products and Digiflazz is configured, try to fetch
      if (this.digiflazzConfig?.isConfigured) {
        console.log('No synced products found, trying to fetch from Digiflazz... (Admin)');
        const digiflazzResponse = await this.fetchDigiflazzProducts();
        if (digiflazzResponse.success && digiflazzResponse.data) {
          let products = digiflazzResponse.data;
          
          // Apply custom configurations but NO status filtering for admin
          products = this.applyCustomConfigurations(products);
          
          if (category && category !== 'all') {
            products = products.filter(p => p.category === category);
          }
          
          return {
            success: true,
            data: products
          };
        }
        // If Digiflazz fails, log the error but continue with mock data
        console.warn('Digiflazz API failed, using mock data:', digiflazzResponse.error);
      }

      // Fallback to mock data
      console.log('Using mock data as fallback (Admin)');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let products = [...mockProducts] as Product[];
      
      // Apply custom configurations but NO status filtering for admin
      products = this.applyCustomConfigurations(products);
      
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }

      return {
        success: true,
        data: products
      };
    } catch (error) {
      console.error('Error in getProductsForAdmin:', error);
      return {
        success: false,
        error: 'Failed to fetch products'
      };
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      // First, try to get from synced products
      const syncedProducts = localStorage.getItem('digiflazz_products');
      
      if (syncedProducts) {
        let products = JSON.parse(syncedProducts) as Product[];
        products = this.applyCustomConfigurations(products);
        products = this.applyStatusFiltering(products); // Apply status filtering for user
        const product = products.find(p => p.id === id);
        if (product) {
          return {
            success: true,
            data: product
          };
        }
      }

      // If not found in synced products and Digiflazz is configured, try to fetch
      if (this.digiflazzConfig?.isConfigured) {
        const digiflazzResponse = await this.fetchDigiflazzProducts();
        if (digiflazzResponse.success && digiflazzResponse.data) {
          const products = this.applyStatusFiltering(this.applyCustomConfigurations(digiflazzResponse.data));
          const product = products.find(p => p.id === id);
          if (product) {
            return {
              success: true,
              data: product
            };
          }
        }
      }

      // Fallback to mock data
      let products = [...mockProducts] as Product[];
      products = this.applyCustomConfigurations(products);
      products = this.applyStatusFiltering(products); // Apply status filtering for user
      const product = products.find(p => p.id === id);
      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        };
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch product'
      };
    }
  }

  // Apply status filtering (hide inactive products/variants for users)
  private applyStatusFiltering(products: Product[]): Product[] {
    const statusOverrides = this.getStatusOverrides();
    
    return products
      .map(product => {
        // Check if product is overridden to inactive
        const productStatus = statusOverrides[product.id];
        if (productStatus === 'inactive') {
          return null; // Hide entire product
        }
        
        // Filter out inactive variants
        const activeVariants = product.variants.filter(variant => {
          const variantStatusKey = `${product.id}-${variant.id}`;
          const variantStatus = statusOverrides[variantStatusKey];
          
          // If variant is explicitly set to inactive, hide it
          if (variantStatus === 'inactive') {
            return false;
          }
          
          // If variant is explicitly set to active, show it
          if (variantStatus === 'active') {
            return true;
          }
          
          // Default: show if variant status is active
          return variant.status === 'active';
        });
        
        // If no active variants, hide the product
        if (activeVariants.length === 0) {
          return null;
        }
        
        return {
          ...product,
          variants: activeVariants
        };
      })
      .filter((product): product is Product => product !== null);
  }

  // Apply custom configurations (prices, game ID configs, status overrides, images)
  private applyCustomConfigurations(products: Product[]): Product[] {
    const customPrices = this.getCustomPrices();
    const statusOverrides = this.getStatusOverrides();
    const gameIdConfigs = this.getGameIdConfigs();
    const customImages = this.getCustomImages();
    
    return products.map(product => {
      // Apply product-level status override
      const productStatus = statusOverrides[product.id];
      
      // Apply custom game ID configuration if exists
      const customGameIdConfig = gameIdConfigs[product.id];
      
      // Apply custom image if exists
      const customImage = customImages[product.id];
      
      const updatedProduct = {
        ...product,
        status: productStatus || product.status,
        gameIdConfig: customGameIdConfig || product.gameIdConfig,
        image: customImage || product.image, // Apply custom image
        variants: product.variants.map(variant => {
          const priceKey = `${product.id}-${variant.id}`;
          const statusKey = `${product.id}-${variant.id}`;
          const customPrice = customPrices[priceKey];
          const variantStatus = statusOverrides[statusKey];
          
          return {
            ...variant,
            price: customPrice !== undefined ? customPrice : variant.price,
            status: variantStatus || variant.status
          };
        })
      };
      
      return updatedProduct;
    });
  }

  // Get custom prices from localStorage
  private getCustomPrices(): Record<string, number> {
    const stored = localStorage.getItem('custom_prices');
    return stored ? JSON.parse(stored) : {};
  }

  // Save custom price for a specific variant
  saveCustomPrice(productId: string, variantId: string, price: number): void {
    const customPrices = this.getCustomPrices();
    const priceKey = `${productId}-${variantId}`;
    
    customPrices[priceKey] = price;
    customPrices.timestamp = new Date().toISOString();
    
    localStorage.setItem('custom_prices', JSON.stringify(customPrices));
    console.log(`Saved custom price for ${priceKey}: ${price}`);
  }

  // Update product status
  updateProductStatus(productId: string, status: 'active' | 'inactive'): void {
    const statusOverrides = this.getStatusOverrides();
    statusOverrides[productId] = status;
    statusOverrides.timestamp = new Date().toISOString();
    
    localStorage.setItem('status_overrides', JSON.stringify(statusOverrides));
    console.log(`Updated product status for ${productId}: ${status}`);
  }

  // Update variant status
  updateVariantStatus(productId: string, variantId: string, status: 'active' | 'inactive'): void {
    const statusOverrides = this.getStatusOverrides();
    const statusKey = `${productId}-${variantId}`;
    statusOverrides[statusKey] = status;
    statusOverrides.timestamp = new Date().toISOString();
    
    localStorage.setItem('status_overrides', JSON.stringify(statusOverrides));
    console.log(`Updated variant status for ${statusKey}: ${status}`);
  }

  // Get status overrides from localStorage
  private getStatusOverrides(): Record<string, string> {
    const stored = localStorage.getItem('status_overrides');
    return stored ? JSON.parse(stored) : {};
  }

  // Real Digiflazz API call
  async fetchDigiflazzProducts(): Promise<ApiResponse<Product[]>> {
    try {
      if (!this.digiflazzConfig?.isConfigured) {
        return {
          success: false,
          error: 'Digiflazz API not configured'
        };
      }

      const signature = generateDigiflazzSignature(
        this.digiflazzConfig.username,
        this.digiflazzConfig.apiKey,
        'pricelist'
      );

      const requestBody = {
        cmd: 'pricelist',
        username: this.digiflazzConfig.username,
        sign: signature
      };

      console.log('Fetching from Digiflazz API...', { url: this.DIGIFLAZZ_API_URL, body: requestBody });

      const response = await fetch(this.DIGIFLAZZ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Digiflazz API Response:', data);

      // Check for Digiflazz-specific error codes
      if (data.rc && data.rc !== '00') {
        const errorMessage = data.message || `Digiflazz API error (code: ${data.rc})`;
        console.error('Digiflazz API returned error:', { rc: data.rc, message: data.message });
        return {
          success: false,
          error: `Digiflazz API Error: ${errorMessage}`
        };
      }

      // Handle various possible response formats
      let productsArray: DigiflazzProduct[] | null = null;

      // Try different possible response structures
      if (data.data && Array.isArray(data.data.products)) {
        productsArray = data.data.products;
      } else if (Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (Array.isArray(data)) {
        productsArray = data;
      }

      if (productsArray && productsArray.length > 0) {
        const products = this.transformDigiflazzToProducts(productsArray);
        
        if (products.length === 0) {
          console.warn('No active products found after transformation');
          return {
            success: false,
            error: 'No active products available in your Digiflazz account. Please check if you have active products or contact Digiflazz support.'
          };
        }
        
        // Store the fetched products - THIS IS KEY FOR USER DISPLAY
        localStorage.setItem('digiflazz_products', JSON.stringify(products));
        localStorage.setItem('digiflazz_last_sync', new Date().toISOString());
        
        console.log(`Successfully synced ${products.length} products to localStorage`);
        
        return {
          success: true,
          data: products
        };
      } else if (productsArray && productsArray.length === 0) {
        console.warn('Empty product list received from Digiflazz');
        return {
          success: false,
          error: 'Your Digiflazz account has no active products. Please contact Digiflazz to activate products or check your account status.'
        };
      } else {
        console.warn('Unexpected response structure from Digiflazz:', data);
        return {
          success: false,
          error: 'Unexpected response format from Digiflazz API. Please check your API configuration or contact support.'
        };
      }
    } catch (error) {
      console.error('Digiflazz API Error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to connect to Digiflazz API';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to connect to Digiflazz API. Please check your internet connection.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = `Server error: ${error.message}. Please try again later.`;
        } else {
          errorMessage = `API Error: ${error.message}`;
        }
      }
      
      // Try to use cached data if available
      const cachedProducts = localStorage.getItem('digiflazz_products');
      if (cachedProducts) {
        console.log('Using cached Digiflazz products due to API error');
        return {
          success: true,
          data: JSON.parse(cachedProducts)
        };
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private transformDigiflazzToProducts(digiflazzData: DigiflazzProduct[]): Product[] {
    const productMap = new Map<string, Product>();

    digiflazzData.forEach(item => {
      // Skip products that don't have the required status fields or are inactive
      if (!item.buyer_product_status || !item.seller_product_status) {
        return;
      }

      // Skip if the product status is not active (assuming true means active)
      if (item.buyer_product_status !== true || item.seller_product_status !== true) {
        return;
      }

      const brandKey = item.brand.toLowerCase().replace(/\s+/g, '-');
      const category = this.mapCategoryFromBrand(item.brand);
      
      if (!productMap.has(brandKey)) {
        productMap.set(brandKey, {
          id: brandKey,
          name: `${item.brand} ${this.getCurrencyFromBrand(item.brand)}`,
          brand: item.brand,
          category: category,
          code: brandKey.toUpperCase(),
          image: this.getImageFromBrand(item.brand),
          description: `Top up ${this.getCurrencyFromBrand(item.brand)} untuk ${item.brand}`,
          type: 'prepaid',
          status: 'active',
          isPopular: this.isPopularBrand(item.brand),
          gameIdConfig: this.getDefaultGameIdConfig(item.brand),
          variants: []
        });
      }

      const product = productMap.get(brandKey)!;
      
      // Add markup to price (10% markup for demo)
      const basePrice = item.price;
      const sellingPrice = Math.round(basePrice * 1.1);
      
      product.variants.push({
        id: item.buyer_sku_code,
        name: item.product_name,
        amount: this.extractAmountFromName(item.product_name),
        price: sellingPrice,
        originalPrice: basePrice,
        code: item.buyer_sku_code,
        status: 'active'
      });
    });

    // Sort variants by price for each product
    Array.from(productMap.values()).forEach(product => {
      product.variants.sort((a, b) => a.price - b.price);
    });

    return Array.from(productMap.values());
  }

  private getDefaultGameIdConfig(brand: string): GameIdConfig {
    const brandLower = brand.toLowerCase();
    
    if (brandLower.includes('mobile legends')) {
      return {
        requiresGameId: true,
        gameIdLabel: 'User ID',
        gameIdPlaceholder: 'Masukkan User ID (contoh: 123456789)',
        requiresServerId: true,
        serverIdLabel: 'Server ID',
        serverIdPlaceholder: 'Masukkan Server ID (contoh: 2001)',
        gameIdFormat: 'numeric',
        gameIdMinLength: 6,
        gameIdMaxLength: 12,
        serverIdFormat: 'numeric',
        serverIdMinLength: 4,
        serverIdMaxLength: 4
      };
    }
    
    if (brandLower.includes('free fire')) {
      return {
        requiresGameId: true,
        gameIdLabel: 'Player ID',
        gameIdPlaceholder: 'Masukkan Player ID (contoh: 123456789)',
        requiresServerId: false,
        gameIdFormat: 'numeric',
        gameIdMinLength: 8,
        gameIdMaxLength: 12
      };
    }
    
    if (brandLower.includes('pubg')) {
      return {
        requiresGameId: true,
        gameIdLabel: 'Player ID',
        gameIdPlaceholder: 'Masukkan Player ID (contoh: 5123456789)',
        requiresServerId: false,
        gameIdFormat: 'numeric',
        gameIdMinLength: 10,
        gameIdMaxLength: 10
      };
    }
    
    if (brandLower.includes('genshin')) {
      return {
        requiresGameId: true,
        gameIdLabel: 'UID',
        gameIdPlaceholder: 'Masukkan UID (contoh: 800123456)',
        requiresServerId: true,
        serverIdLabel: 'Server ID',
        serverIdPlaceholder: 'Masukkan Server ID (contoh: os_asia)',
        gameIdFormat: 'numeric',
        gameIdMinLength: 9,
        gameIdMaxLength: 9,
        serverIdFormat: 'alphanumeric',
        serverIdMinLength: 3,
        serverIdMaxLength: 10
      };
    }
    
    if (brandLower.includes('valorant')) {
      return {
        requiresGameId: true,
        gameIdLabel: 'Riot ID',
        gameIdPlaceholder: 'Masukkan Riot ID (contoh: PlayerName#1234)',
        requiresServerId: false,
        gameIdFormat: 'alphanumeric',
        gameIdMinLength: 3,
        gameIdMaxLength: 20
      };
    }
    
    // Default configuration for unknown games
    return {
      requiresGameId: true,
      gameIdLabel: 'Game ID',
      gameIdPlaceholder: 'Masukkan Game ID',
      requiresServerId: false,
      gameIdFormat: 'alphanumeric',
      gameIdMinLength: 3,
      gameIdMaxLength: 20
    };
  }

  private mapCategoryFromBrand(brand: string): string {
    const brandLower = brand.toLowerCase();
    
    if (brandLower.includes('mobile legends') || brandLower.includes('ml')) return 'moba';
    if (brandLower.includes('free fire') || brandLower.includes('pubg')) return 'battle_royale';
    if (brandLower.includes('genshin') || brandLower.includes('honkai')) return 'rpg';
    if (brandLower.includes('valorant') || brandLower.includes('csgo')) return 'fps';
    if (brandLower.includes('racing') || brandLower.includes('car')) return 'racing';
    if (brandLower.includes('fifa') || brandLower.includes('sport')) return 'sports';
    
    return 'rpg'; // default
  }

  private getCurrencyFromBrand(brand: string): string {
    const brandLower = brand.toLowerCase();
    
    if (brandLower.includes('mobile legends')) return 'Diamonds';
    if (brandLower.includes('free fire')) return 'Diamonds';
    if (brandLower.includes('pubg')) return 'UC';
    if (brandLower.includes('genshin')) return 'Genesis Crystals';
    if (brandLower.includes('valorant')) return 'Points';
    
    return 'Credits';
  }

  private getImageFromBrand(brand: string): string {
    const brandLower = brand.toLowerCase();
    
    if (brandLower.includes('mobile legends')) return 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300';
    if (brandLower.includes('free fire')) return 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300';
    if (brandLower.includes('pubg')) return 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=300';
    if (brandLower.includes('genshin')) return 'https://images.pexels.com/photos/7862604/pexels-photo-7862604.jpeg?auto=compress&cs=tinysrgb&w=300';
    if (brandLower.includes('valorant')) return 'https://images.pexels.com/photos/9072319/pexels-photo-9072319.jpeg?auto=compress&cs=tinysrgb&w=300';
    
    return 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300';
  }

  private isPopularBrand(brand: string): boolean {
    const popularBrands = ['mobile legends', 'free fire', 'pubg', 'valorant'];
    return popularBrands.some(popular => brand.toLowerCase().includes(popular));
  }

  private extractAmountFromName(productName: string): string {
    // Extract amount from product name (e.g., "Mobile Legends 5 Diamond" -> "5 Diamonds")
    const match = productName.match(/(\d+)\s*(diamond|uc|crystal|point|credit)/i);
    if (match) {
      const amount = match[1];
      const currency = match[2].toLowerCase();
      
      if (currency.includes('diamond')) return `${amount} Diamonds`;
      if (currency.includes('uc')) return `${amount} UC`;
      if (currency.includes('crystal')) return `${amount} Genesis Crystals`;
      if (currency.includes('point')) return `${amount} Points`;
      if (currency.includes('credit')) return `${amount} Credits`;
    }
    
    return productName;
  }

  // Method to clear synced products (for testing)
  clearSyncedProducts(): void {
    localStorage.removeItem('digiflazz_products');
    localStorage.removeItem('digiflazz_last_sync');
    localStorage.removeItem('custom_prices');
    localStorage.removeItem('status_overrides');
    localStorage.removeItem('game_id_configs');
    localStorage.removeItem('custom_images');
    console.log('Cleared synced products and custom settings from localStorage');
  }

  // Method to check if we have synced products
  hasSyncedProducts(): boolean {
    return !!localStorage.getItem('digiflazz_products');
  }

  // Transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Transaction>> {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Store in localStorage (simulate database)
      const transactions = this.getStoredTransactions();
      transactions.push(newTransaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Simulate processing
      setTimeout(() => {
        this.updateTransactionStatus(newTransaction.id, 'success');
      }, 3000);

      return {
        success: true,
        data: newTransaction
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create transaction'
      };
    }
  }

  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const transactions = this.getStoredTransactions();
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch transactions'
      };
    }
  }

  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    try {
      const transactions = this.getStoredTransactions();
      const transaction = transactions.find(t => t.id === id);
      
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      return {
        success: true,
        data: transaction
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch transaction'
      };
    }
  }

  private updateTransactionStatus(id: string, status: Transaction['status']): void {
    const transactions = this.getStoredTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      transactions[index].status = status;
      transactions[index].updatedAt = new Date().toISOString();
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }

  private getStoredTransactions(): Transaction[] {
    const stored = localStorage.getItem('transactions');
    return stored ? JSON.parse(stored) : [...mockTransactions];
  }

  // Admin
  async adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      // Simple demo authentication
      if (username === 'admin' && password === 'admin123') {
        const token = btoa(`${username}:${Date.now()}`);
        localStorage.setItem('admin_token', token);
        
        return {
          success: true,
          data: { token }
        };
      }

      return {
        success: false,
        error: 'Invalid credentials'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  isAdminAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  adminLogout(): void {
    localStorage.removeItem('admin_token');
  }

  // Get last sync info
  getLastSyncInfo(): { lastSync: string | null; hasCache: boolean } {
    const lastSync = localStorage.getItem('digiflazz_last_sync');
    const hasCache = !!localStorage.getItem('digiflazz_products');
    
    return { lastSync, hasCache };
  }
}

export const apiService = new ApiService();