import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, SupplierProductMapping } from '../types';

interface ProductStore {
  products: Product[];
  mappings: SupplierProductMapping[];

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  getProductByEan: (ean: string) => Product | undefined;

  // Mapping actions
  addMapping: (mapping: Omit<SupplierProductMapping, 'id' | 'createdAt' | 'lastSeenAt'>) => void;
  findMapping: (supplierId: string, supplierProductCode: string) => SupplierProductMapping | undefined;
  removeMapping: (id: string) => void;
  updateMappingLastSeen: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      mappings: [],

      addProduct: (productData) => {
        const existingProduct = get().products.find(p => p.ean === productData.ean);
        if (existingProduct) {
          // Update existing product
          set(state => ({
            products: state.products.map(p =>
              p.ean === productData.ean
                ? { ...p, ...productData, updatedAt: new Date() }
                : p
            ),
          }));
          return get().products.find(p => p.ean === productData.ean)!;
        }

        const newProduct: Product = {
          ...productData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          products: [newProduct, ...state.products],
        }));

        return newProduct;
      },

      updateProduct: (id, updates) => {
        set(state => ({
          products: state.products.map(p =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        }));
      },

      removeProduct: (id) => {
        set(state => ({
          products: state.products.filter(p => p.id !== id),
        }));
      },

      getProductByEan: (ean) => {
        return get().products.find(p => p.ean === ean);
      },

      addMapping: (mappingData) => {
        const existingMapping = get().findMapping(
          mappingData.supplierId,
          mappingData.supplierProductCode
        );

        if (existingMapping) {
          // Update existing mapping
          set(state => ({
            mappings: state.mappings.map(m =>
              m.id === existingMapping.id
                ? { ...m, ...mappingData, lastSeenAt: new Date() }
                : m
            ),
          }));
          return;
        }

        const newMapping: SupplierProductMapping = {
          ...mappingData,
          id: generateId(),
          createdAt: new Date(),
          lastSeenAt: new Date(),
        };

        set(state => ({
          mappings: [newMapping, ...state.mappings],
        }));
      },

      findMapping: (supplierId, supplierProductCode) => {
        return get().mappings.find(
          m => m.supplierId === supplierId && m.supplierProductCode === supplierProductCode
        );
      },

      removeMapping: (id) => {
        set(state => ({
          mappings: state.mappings.filter(m => m.id !== id),
        }));
      },

      updateMappingLastSeen: (id) => {
        set(state => ({
          mappings: state.mappings.map(m =>
            m.id === id
              ? { ...m, lastSeenAt: new Date() }
              : m
          ),
        }));
      },
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        products: state.products,
        mappings: state.mappings,
      }),
    }
  )
);
