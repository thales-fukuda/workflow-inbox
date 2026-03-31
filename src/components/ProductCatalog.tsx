import { useState } from 'react';
import { useProductStore } from '../store/productStore';
import { useLanguage } from '../i18n/LanguageContext';

export const ProductCatalog = () => {
  const { t } = useLanguage();
  const { products, mappings, removeProduct, removeMapping } = useProductStore();
  const [activeTab, setActiveTab] = useState<'products' | 'mappings'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ean.includes(searchQuery) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMappings = mappings.filter(m =>
    m.supplierProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.ean.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t('productCatalog')}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{products.length} {t('products')}</span>
            <span>•</span>
            <span>{mappings.length} {t('mappings')}</span>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={t('searchProducts')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        />

        {/* Tabs */}
        <div className="flex mt-4 border-b border-slate-200 dark:border-slate-700 -mx-4 px-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t('products')} ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'mappings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t('supplierMappings')} ({filteredMappings.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'products' ? (
          filteredProducts.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-12">
              <div className="text-4xl mb-3">📦</div>
              <p>{t('noProductsYet')}</p>
              <p className="text-sm mt-1">{t('productsAddedFromInvoices')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded flex items-center justify-center text-slate-400">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                          {product.ean}
                        </span>
                        {product.brand && <span>• {product.brand}</span>}
                        {product.category && <span>• {product.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      product.source === 'invoice'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : product.source === 'api'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                      {product.source}
                    </span>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title={t('delete')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredMappings.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-12">
              <div className="text-4xl mb-3">🔗</div>
              <p>{t('noMappingsYet')}</p>
              <p className="text-sm mt-1">{t('mappingsCreatedWhenResolving')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {mapping.supplierProductName}
                      </p>
                      <span className="text-slate-400">→</span>
                      <span className="font-mono text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                        {mapping.ean}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{mapping.supplierName}</span>
                      <span>•</span>
                      <span className="font-mono">{mapping.supplierProductCode}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        mapping.confidence === 'manual'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : mapping.confidence === 'confirmed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {mapping.confidence}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMapping(mapping.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title={t('delete')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
