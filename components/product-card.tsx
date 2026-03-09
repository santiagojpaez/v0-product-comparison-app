'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Truck, Plus, Check } from 'lucide-react';
import type { ProductSummaryDTO } from '@/lib/types';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductSummaryDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct, isInComparison, canAdd } = useComparison();
  const inComparison = isInComparison(product.id);

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inComparison && canAdd) {
      addProduct(product);
    }
  };

  const discountPercentage = product.price.originalAmount
    ? Math.round((1 - product.price.amount / product.price.originalAmount) * 100)
    : null;

  const conditionConfig = {
    NEW: { label: 'Nuevo', className: 'bg-[#00A650] text-white' },
    USED: { label: 'Usado', className: 'bg-[#666666] text-white' },
    REFURBISHED: { label: 'Reacondicionado', className: 'bg-[#FF7733] text-white' },
  };

  const condition = conditionConfig[product.condition];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-white p-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
              Sin imagen
            </div>
          )}
          {/* Condition Badge */}
          <span
            className={cn(
              'absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium',
              condition.className
            )}
          >
            {condition.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Name */}
          <h3 className="mb-2 line-clamp-2 text-sm font-normal text-black">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mb-2">
            {product.price.originalAmount && (
              <p className="text-xs text-[#999999] line-through">
                {product.price.currency} {product.price.originalAmount.toLocaleString()}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-normal text-black">
                {product.price.currency} {product.price.amount.toLocaleString()}
              </span>
              {discountPercentage && discountPercentage > 0 && (
                <span className="text-sm font-medium text-[#00A650]">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Free Shipping */}
          {product.shipping.freeShipping && (
            <div className="mb-2 flex items-center gap-1 text-sm text-[#00A650]">
              <Truck className="h-4 w-4" />
              <span>Envío gratis</span>
            </div>
          )}

          {/* Rating */}
          {product.rating !== null && (
            <div className="mt-auto flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3.5 w-3.5',
                      star <= Math.round(product.rating!)
                        ? 'fill-[#FFE600] text-[#FFE600]'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-[#999999]">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Add to Comparison Button */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          onClick={handleAddToComparison}
          disabled={inComparison || !canAdd}
          className={cn(
            'gap-1 shadow-md',
            inComparison
              ? 'bg-[#00A650] text-white hover:bg-[#00A650]'
              : 'bg-[#FFE600] text-black hover:bg-[#FFD000]'
          )}
        >
          {inComparison ? (
            <>
              <Check className="h-4 w-4" />
              Agregado
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Comparar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
