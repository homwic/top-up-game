import React from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Zap, Star, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, className = '' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  // Get the cheapest variant for display
  const cheapestVariant = product.variants.reduce((min, variant) => 
    variant.price < min.price ? variant : min
  );

  // Get variant count
  const variantCount = product.variants.length;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-blue-200 ${className}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-400">{product.brand.charAt(0)}</div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isPopular && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </span>
          )}
          {cheapestVariant.originalPrice && cheapestVariant.originalPrice > cheapestVariant.price && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
              <Zap className="w-3 h-3" />
              Sale
            </span>
          )}
        </div>

        {/* Variant Count */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            {variantCount} Pilihan
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mulai dari</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(cheapestVariant.price)}
            </span>
          </div>
          
          {/* View Details Arrow */}
          <div className="flex items-center text-blue-600 group-hover:text-blue-700">
            <span className="text-sm font-medium mr-1">Lihat</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Variant Preview */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{variantCount} varian tersedia</span>
            <span>
              {formatCurrency(cheapestVariant.price)} - {formatCurrency(Math.max(...product.variants.map(v => v.price)))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;