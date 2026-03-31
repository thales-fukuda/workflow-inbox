import { useState, useRef } from 'react';
import type { InvoiceData } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCurrency } from '../utils/formatTime';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: InvoiceData, fileName: string) => void;
}

const API_ENDPOINT = 'https://ypfygomzx5.execute-api.us-east-1.amazonaws.com/prod/extract-invoice';

type UploadState = 'idle' | 'uploading' | 'processing' | 'preview' | 'error';

export const UploadModal = ({ isOpen, onClose, onExtracted }: UploadModalProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const resetState = () => {
    setState('idle');
    setError('');
    setFileName('');
    setExtractedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/xml', 'text/xml'];
    const isXml = file.name.toLowerCase().endsWith('.xml');
    if (!validTypes.includes(file.type) && !isXml) {
      setError(t('invalidFileType'));
      setState('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('fileTooLarge'));
      setState('error');
      return;
    }

    setFileName(file.name);
    setState('uploading');

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setState('processing');

      // Call API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64: base64,
          contentType: file.type,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract invoice data');
      }

      const data: InvoiceData = await response.json();
      setExtractedData(data);
      setState('preview');
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExtracted(extractedData, fileName);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('uploadInvoice')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {state === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-4xl mb-3">📄</div>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                {t('dragDropInvoice')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t('supportedFormats')}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 btn-press"
              >
                {t('selectFile')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xml,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {(state === 'uploading' || state === 'processing') && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {state === 'uploading' ? t('uploadingFile') : t('analyzingInvoice')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {fileName}
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8 animate-fade-in">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                {t('extractionFailed')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {error}
              </p>
              <button
                onClick={resetState}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all duration-200 btn-press"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {state === 'preview' && extractedData && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span>✓</span>
                <span className="font-medium">{t('dataExtracted')}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('supplier')}</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.supplier}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('invoiceNumber')}</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.invoiceNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('date')}</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.date}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('total')}</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(extractedData.total, extractedData.currency)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('lineItems')} ({extractedData.lineItems.length})
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {extractedData.lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm py-1 px-2 rounded bg-white dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                          {item.isNewSku && (
                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded flex-shrink-0">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === 'preview' && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            <button
              onClick={resetState}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all duration-200 btn-press"
            >
              {t('uploadDifferent')}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 btn-press hover:shadow-lg hover:shadow-indigo-500/25"
            >
              {t('createWorkflow')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
