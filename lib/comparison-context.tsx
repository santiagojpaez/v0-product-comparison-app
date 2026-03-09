'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ProductListItem } from './types';

interface ComparisonContextType {
  products: ProductListItem[];
  addProduct: (product: ProductListItem) => boolean;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isInComparison: (productId: string) => boolean;
  canAdd: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

const MAX_PRODUCTS = 5;

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductListItem[]>([]);

  const addProduct = useCallback((product: ProductListItem): boolean => {
    let added = false;
    setProducts((prev) => {
      if (prev.length >= MAX_PRODUCTS) return prev;
      if (prev.some((p) => p.id === product.id)) return prev;
      added = true;
      return [...prev, product];
    });
    return added;
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearProducts = useCallback(() => {
    setProducts([]);
  }, []);

  const isInComparison = useCallback(
    (productId: string) => products.some((p) => p.id === productId),
    [products]
  );

  const canAdd = products.length < MAX_PRODUCTS;

  return (
    <ComparisonContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        clearProducts,
        isInComparison,
        canAdd,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
