'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Info } from 'lucide-react';
import { getCategory, getCategoryProducts } from '@/lib/api';
import type { Category, ProductListItem, PaginatedResponse } from '@/lib/types';
import { ProductGrid } from '@/components/product-grid';
import { Button } from '@/components/ui/button';

interface CategoryProductsPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryProductsPage({ params }: CategoryProductsPageProps) {
  const { id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [productsData, setProductsData] = useState<PaginatedResponse<ProductListItem> | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [categoryData, products] = await Promise.all([
          getCategory(id),
          getCategoryProducts(id, page, 12),
        ]);
        setCategory(categoryData);
        setProductsData(products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, page]);

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md bg-white p-8">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <Info className="h-6 w-6 text-[#F23D4F]" />
        </div>
        <p className="text-lg font-medium text-black">Error al cargar la categoría</p>
        <p className="mt-2 text-sm text-[#999999]">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#FFE600] text-black hover:bg-[#FFD000]"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      {category && (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#999999]">
          <Link href="/" className="hover:text-[#3483FA]">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-black">{category.name}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-black">
          {category?.name || 'Cargando...'}
        </h1>
        {category && (
          <Link href={`/category/${id}/details`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-gray-300 text-[#3483FA] hover:bg-[#F7F7F7]"
            >
              <Info className="h-4 w-4" />
              Ver detalles
            </Button>
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={productsData?.content || []}
        page={page}
        totalPages={productsData?.totalPages || 0}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
