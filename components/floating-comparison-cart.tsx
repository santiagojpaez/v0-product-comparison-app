'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, GitCompare } from 'lucide-react';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';

export function FloatingComparisonCart() {
  const { products, removeProduct } = useComparison();

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 rounded-lg bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-black">
          Comparación ({products.length}/5)
        </h3>
      </div>
      
      <div className="mb-3 space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-2 rounded bg-[#F7F7F7] p-2"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <span className="flex-1 truncate text-sm text-black">
              {product.name}
            </span>
            <button
              onClick={() => removeProduct(product.id)}
              className="flex-shrink-0 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              aria-label={`Quitar ${product.name} de la comparación`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Link href="/comparison" className="block">
        <Button className="w-full gap-2 bg-[#FFE600] text-black hover:bg-[#FFD000]">
          <GitCompare className="h-4 w-4" />
          Comparar productos
        </Button>
      </Link>
    </div>
  );
}
