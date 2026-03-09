'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Truck, 
  Package, 
  ShoppingCart,
  Plus,
  Check,
  Info 
} from 'lucide-react';
import { getProduct } from '@/lib/api';
import type { Product, ProductAttribute } from '@/lib/types';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { addProduct, isInComparison, canAdd } = useComparison();
  const inComparison = product ? isInComparison(product.id) : false;

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProduct(id);
        setProduct(data);
        // Expand all groups by default
        const groups = new Set(data.attributes.map(a => a.groupId));
        setExpandedGroups(groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAddToComparison = () => {
    if (product && !inComparison && canAdd) {
      addProduct({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        condition: product.condition,
        price: product.price,
        currency: product.currency,
        originalAmount: product.originalAmount,
        rating: product.rating,
        ratingCount: product.ratingCount,
        freeShipping: product.freeShipping,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md bg-white p-8">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <Info className="h-6 w-6 text-[#F23D4F]" />
        </div>
        <p className="text-lg font-medium text-black">Error al cargar el producto</p>
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

  const conditionConfig = {
    NEW: { label: 'Nuevo', className: 'bg-[#00A650] text-white' },
    USED: { label: 'Usado', className: 'bg-[#666666] text-white' },
    REFURBISHED: { label: 'Reacondicionado', className: 'bg-[#FF7733] text-white' },
  };

  const condition = conditionConfig[product.condition];

  const discountPercentage = product.originalAmount
    ? Math.round((1 - product.price / product.originalAmount) * 100)
    : null;

  // Group attributes by group
  const attributesByGroup = product.attributes.reduce((acc, attr) => {
    if (!acc[attr.groupId]) {
      acc[attr.groupId] = {
        groupName: attr.groupName,
        attributes: [],
      };
    }
    acc[attr.groupId].attributes.push(attr);
    return acc;
  }, {} as Record<string, { groupName: string; attributes: ProductAttribute[] }>);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-[#999999]">
        <Link href="/" className="hover:text-[#3483FA]">
          Inicio
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/category/${product.category.id}`} className="hover:text-[#3483FA]">
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-black">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-md bg-white">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              crossOrigin="anonymous"
              priority
            />
          </div>

          {/* Details */}
          <div>
            {/* Condition Badge */}
            <span
              className={cn(
                'mb-2 inline-block rounded px-2 py-0.5 text-xs font-medium',
                condition.className
              )}
            >
              {condition.label}
            </span>

            {/* Name */}
            <h1 className="mb-4 text-xl font-medium text-black">{product.name}</h1>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= Math.round(product.rating)
                        ? 'fill-[#FFE600] text-[#FFE600]'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-[#3483FA]">
                {product.rating.toFixed(1)} ({product.ratingCount} opiniones)
              </span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {product.originalAmount && (
                <p className="text-sm text-[#999999] line-through">
                  {product.currency} {product.originalAmount.toLocaleString()}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-black">
                  {product.currency} {product.price.toLocaleString()}
                </span>
                {discountPercentage && (
                  <span className="text-lg font-medium text-[#00A650]">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Shipping */}
            {product.freeShipping && (
              <div className="mb-4 flex items-center gap-2 text-[#00A650]">
                <Truck className="h-5 w-5" />
                <span className="font-medium">Envío gratis</span>
              </div>
            )}

            {/* Stock */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-black">
                <Package className="h-4 w-4 text-[#666666]" />
                <span>Stock disponible: {product.stock}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black">
                <ShoppingCart className="h-4 w-4 text-[#666666]" />
                <span>{product.unitsSold} vendidos</span>
              </div>
            </div>

            {/* Category Link */}
            <div className="mb-6 text-sm">
              <span className="text-[#666666]">Categoría: </span>
              <Link
                href={`/category/${product.category.id}`}
                className="text-[#3483FA] hover:underline"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Add to Comparison */}
            <Button
              onClick={handleAddToComparison}
              disabled={inComparison || !canAdd}
              className={cn(
                'w-full gap-2 text-lg',
                inComparison
                  ? 'bg-[#00A650] text-white hover:bg-[#00A650]'
                  : 'bg-[#FFE600] text-black hover:bg-[#FFD000]'
              )}
              size="lg"
            >
              {inComparison ? (
                <>
                  <Check className="h-5 w-5" />
                  Agregado a comparación
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Agregar a comparación
                </>
              )}
            </Button>
            {!canAdd && !inComparison && (
              <p className="mt-2 text-center text-sm text-[#999999]">
                Ya tenés 5 productos en comparación
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="mt-6">
        <h2 className="mb-4 text-xl font-medium text-black">Características</h2>
        <div className="space-y-2">
          {Object.entries(attributesByGroup).map(([groupId, group]) => (
            <div key={groupId} className="overflow-hidden rounded-md bg-white shadow-sm">
              <button
                onClick={() => toggleGroup(groupId)}
                className="flex w-full items-center justify-between bg-[#EBEBEB] px-4 py-3 text-left"
              >
                <span className="text-sm font-medium uppercase text-[#666666]">
                  {group.groupName}
                </span>
                {expandedGroups.has(groupId) ? (
                  <ChevronUp className="h-4 w-4 text-[#666666]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#666666]" />
                )}
              </button>
              {expandedGroups.has(groupId) && (
                <div className="grid grid-cols-1 gap-px bg-gray-200 md:grid-cols-2">
                  {group.attributes.map((attr) => (
                    <div
                      key={attr.attributeId}
                      className="flex justify-between bg-white px-4 py-3"
                    >
                      <span className="text-sm text-[#666666]">{attr.name}</span>
                      <span className="text-sm font-medium text-black">
                        {attr.displayValue || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
