'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Info } from 'lucide-react';
import { getCategories, searchProducts } from '@/lib/api';
import type { Category, ProductListItem, PaginatedResponse } from '@/lib/types';
import { ProductGrid } from '@/components/product-grid';
import { Button } from '@/components/ui/button';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsData, setProductsData] = useState<PaginatedResponse<ProductListItem> | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(categoryId);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(flattenCategories(data));
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Search when params change
  useEffect(() => {
    async function performSearch() {
      if (!q && !categoryId) {
        setProductsData(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const results = await searchProducts({
          q: q || undefined,
          categoryId: categoryId || undefined,
          page,
          size: 12,
        });
        setProductsData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar');
      } finally {
        setIsLoading(false);
      }
    }
    performSearch();
  }, [q, categoryId, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    setPage(0);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-black">Buscar productos</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 rounded-md bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search-input" className="mb-1 block text-sm font-medium text-black">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribí lo que querés encontrar..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-black placeholder:text-gray-400 focus:border-[#3483FA] focus:outline-none focus:ring-1 focus:ring-[#3483FA]"
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="md:w-64">
            <label htmlFor="category-select" className="mb-1 block text-sm font-medium text-black">
              Categoría
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:border-[#3483FA] focus:outline-none focus:ring-1 focus:ring-[#3483FA]"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-[#FFE600] text-black hover:bg-[#FFD000] md:w-auto"
            >
              Buscar
            </Button>
          </div>
        </div>
      </form>

      {/* Results */}
      {error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md bg-white p-8">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <Info className="h-6 w-6 text-[#F23D4F]" />
          </div>
          <p className="text-lg font-medium text-black">Error en la búsqueda</p>
          <p className="mt-2 text-sm text-[#999999]">{error}</p>
        </div>
      ) : productsData ? (
        <div>
          <p className="mb-4 text-sm text-[#666666]">
            {productsData.totalElements} resultados
            {q && <span> para &quot;{q}&quot;</span>}
          </p>
          <ProductGrid
            products={productsData.content}
            page={page}
            totalPages={productsData.totalPages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md bg-white p-8 text-center">
          <Search className="mb-4 h-12 w-12 text-[#999999]" />
          <p className="text-lg font-medium text-black">Buscá productos para comparar</p>
          <p className="mt-2 text-sm text-[#999999]">
            Escribí lo que querés encontrar o seleccioná una categoría
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

// Helper to flatten category tree
function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];
  function traverse(cats: Category[]) {
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    }
  }
  traverse(categories);
  return result;
}
