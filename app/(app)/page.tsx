'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { getCategories } from '@/lib/api';
import type { CategoryTreeDTO } from '@/lib/types';
import { CategoryTree } from '@/components/category-tree';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryTreeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las categorías');
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md bg-white p-8">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <Info className="h-6 w-6 text-[#F23D4F]" />
        </div>
        <p className="text-lg font-medium text-black">Error al cargar las categorías</p>
        <p className="mt-2 text-sm text-[#999999]">{error}</p>
        <p className="mt-4 text-xs text-[#999999]">
          Asegurate de que la API esté corriendo en http://localhost:8080
        </p>
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
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      {/* Category Tree */}
      <aside>
        <CategoryTree categories={categories} />
      </aside>

      {/* Welcome Content */}
      <main>
        <div className="rounded-md bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-2xl font-medium text-black">
            Bienvenido a CompareML
          </h1>
          <p className="mb-6 text-[#666666]">
            Seleccioná una categoría del menú para explorar productos y agregarlos a tu comparación.
            Podés comparar hasta 5 productos lado a lado.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Explorá categorías"
              description="Navegá por el árbol de categorías para encontrar los productos que te interesan."
            />
            <FeatureCard
              title="Agregá a comparación"
              description="Seleccioná hasta 5 productos para compararlos lado a lado."
            />
            <FeatureCard
              title="Compará atributos"
              description="Visualizá las diferencias y encontrá el producto que mejor se adapta a tus necesidades."
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md bg-white p-6 shadow-sm">
            <p className="text-sm text-[#666666]">Categorías disponibles</p>
            <p className="mt-1 text-3xl font-light text-black">
              {countCategories(categories)}
            </p>
          </div>
          <div className="rounded-md bg-white p-6 shadow-sm">
            <p className="text-sm text-[#666666]">API conectada</p>
            <p className="mt-1 text-lg font-medium text-[#00A650]">
              localhost:8080
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-[#F7F7F7] p-4">
      <h3 className="mb-2 font-medium text-black">{title}</h3>
      <p className="text-sm text-[#666666]">{description}</p>
    </div>
  );
}

function countCategories(categories: CategoryTreeDTO[]): number {
  let count = 0;
  function traverse(cats: CategoryTreeDTO[]) {
    for (const cat of cats) {
      count++;
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    }
  }
  traverse(categories);
  return count;
}
