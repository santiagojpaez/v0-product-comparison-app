'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductSummaryDTO } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';

interface ProductGridProps {
  products: ProductSummaryDTO[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  page,
  totalPages,
  onPageChange,
  isLoading,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md bg-white p-8 text-center">
        <p className="text-lg font-medium text-black">No se encontraron productos</p>
        <p className="mt-2 text-sm text-[#999999]">
          Intenta buscar con otros términos o en otra categoría
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="gap-1 border-gray-300 text-black hover:bg-[#F7F7F7]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <span className="text-sm text-black">
            Página {page + 1} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="gap-1 border-gray-300 text-black hover:bg-[#F7F7F7]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
