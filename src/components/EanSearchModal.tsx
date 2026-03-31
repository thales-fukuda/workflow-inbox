import { useState, useEffect } from 'react';
import type { EanSuggestion } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { searchProducts, validateEan, formatEan } from '../services/eanService';

interface EanSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ean: string, productName?: string, saveMapping?: boolean) => void;
  productName: string;
  supplierCode?: string | null;
}

export const EanSearchModal = ({
  isOpen,
  onClose,
  onSelect,
  productName,
  supplierCode,
}: EanSearchModalProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(productName);
  const [manualEan, setManualEan] = useState('');
  const [results, setResults] = useState<EanSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [eanValidation, setEanValidation] = useState<'valid' | 'invalid' | null>(null);
  const [saveMapping, setSaveMapping] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(productName);
      setManualEan('');
      setResults([]);
      setEanValidation(null);
    }
  }, [isOpen, productName]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await searchProducts(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualEanChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 13);
    setManualEan(cleaned);

    if (cleaned.length >= 8) {
      setEanValidation(validateEan(cleaned) ? 'valid' : 'invalid');
    } else {
      setEanValidation(null);
    }
  };

  const handleManualEanSubmit = () => {
    if (eanValidation === 'valid') {
      onSelect(formatEan(manualEan), undefined, saveMapping);
      onClose();
    }
  };

  const handleSelectResult = (result: EanSuggestion) => {
    onSelect(result.ean, result.productName, saveMapping);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('searchEan')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Search by name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('searchByProductName')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('searchByProductName')}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSearching ? '...' : t('search')}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Results ({results.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt=""
                        className="w-12 h-12 object-contain rounded bg-white"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {result.productName}
                      </p>
                      {result.brand && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {result.brand}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        EAN: {result.ean}
                      </p>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && searchQuery && !isSearching && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
              {t('noResultsFound')}
            </p>
          )}

          {/* Manual EAN entry */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('orEnterEanDirectly')}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={manualEan}
                  onChange={(e) => handleManualEanChange(e.target.value)}
                  placeholder="7891234567890"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    eanValidation === 'valid'
                      ? 'border-green-500'
                      : eanValidation === 'invalid'
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
                {eanValidation && (
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                      eanValidation === 'valid' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {eanValidation === 'valid' ? '✓' : '✗'}
                  </span>
                )}
              </div>
              <button
                onClick={handleManualEanSubmit}
                disabled={eanValidation !== 'valid'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('confirm')}
              </button>
            </div>
            {eanValidation === 'invalid' && (
              <p className="text-sm text-red-600 mt-1">{t('invalidEan')}</p>
            )}
          </div>

          {/* Save mapping checkbox */}
          {supplierCode && (
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={saveMapping}
                onChange={(e) => setSaveMapping(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
              />
              {t('saveMappingForFuture')}
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
