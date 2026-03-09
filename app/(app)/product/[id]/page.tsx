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
  Info,
  MapPin
} from 'lucide-react';
import { getProduct } from '@/lib/api';
import type { ProductDetailDTO, AttributeGroupValueDTO } from '@/lib/types';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const { addProduct, isInComparison, canAdd } = useComparison();
  const inComparison = product ? isInComparison(product.productSummary.id) : false;

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProduct(id);
        setProduct(data);
        // Expand all groups by default
        const groups = new Set(data.attributeGroups.map(g => g.groupId));
        setExpandedGroups(groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const toggleGroup = (groupId: number) => {
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
      addProduct(product.productSummary);
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

  const summary = product.productSummary;

  const conditionConfig = {
    NEW: { label: 'Nuevo', className: 'bg-[#00A650] text-white' },
    USED: { label: 'Usado', className: 'bg-[#666666] text-white' },
    REFURBISHED: { label: 'Reacondicionado', className: 'bg-[#FF7733] text-white' },
  };

  const condition = conditionConfig[summary.condition];

  const discountPercentage = summary.price.originalAmount
    ? Math.round((1 - summary.price.amount / summary.price.originalAmount) * 100)
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-[#999999]">
        <Link href="/" className="hover:text-[#3483FA]">
          Inicio
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/category/${product.category.id}`} className="hover:text-[#3483FA]">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-black">{summary.name}</span>
      </div>

      {/* Main Content */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-md bg-white">
            {summary.imageUrl ? (
              <Image
                src={summary.imageUrl}
                alt={summary.name}
                fill
                className="object-contain"
                crossOrigin="anonymous"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                Sin imagen
              </div>
            )}
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
            <h1 className="mb-4 text-xl font-medium text-black">{summary.name}</h1>

            {/* Description */}
            {summary.description && (
              <p className="mb-4 text-sm text-[#666666]">{summary.description}</p>
            )}

            {/* Rating */}
            {summary.rating !== null && (
              <div className="mb-4 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(summary.rating!)
                          ? 'fill-[#FFE600] text-[#FFE600]'
                          : 'fill-gray-200 text-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#3483FA]">
                  {summary.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              {summary.price.originalAmount && (
                <p className="text-sm text-[#999999] line-through">
                  {summary.price.currency} {summary.price.originalAmount.toLocaleString()}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-black">
                  {summary.price.currency} {summary.price.amount.toLocaleString()}
                </span>
                {discountPercentage && discountPercentage > 0 && (
                  <span className="text-lg font-medium text-[#00A650]">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="mb-4 space-y-2">
              {summary.shipping.freeShipping && (
                <div className="flex items-center gap-2 text-[#00A650]">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Envío gratis</span>
                </div>
              )}
              {summary.shipping.storePickup && (
                <div className="flex items-center gap-2 text-[#3483FA]">
                  <MapPin className="h-5 w-5" />
                  <span>Retiro en tienda disponible</span>
                </div>
              )}
            </div>

            {/* Color */}
            {summary.color && (
              <div className="mb-4 text-sm">
                <span className="text-[#666666]">Color: </span>
                <span className="font-medium text-black">{summary.color}</span>
              </div>
            )}

            {/* Stock & Sold */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              {product.availableQuantity !== null && (
                <div className="flex items-center gap-2 text-sm text-black">
                  <Package className="h-4 w-4 text-[#666666]" />
                  <span>Stock disponible: {product.availableQuantity}</span>
                </div>
              )}
              {product.soldQuantity !== null && (
                <div className="flex items-center gap-2 text-sm text-black">
                  <ShoppingCart className="h-4 w-4 text-[#666666]" />
                  <span>{product.soldQuantity} vendidos</span>
                </div>
              )}
            </div>

            {/* Size & Weight */}
            {(product.size || product.weight) && (
              <div className="mb-4 flex flex-wrap gap-4 text-sm">
                {product.size && (
                  <div>
                    <span className="text-[#666666]">Tamaño: </span>
                    <span className="text-black">{product.size}</span>
                  </div>
                )}
                {product.weight !== null && (
                  <div>
                    <span className="text-[#666666]">Peso: </span>
                    <span className="text-black">{product.weight} kg</span>
                  </div>
                )}
              </div>
            )}

            {/* Category Link */}
            {product.category && (
              <div className="mb-6 text-sm">
                <span className="text-[#666666]">Categoría: </span>
                <Link
                  href={`/category/${product.category.id}`}
                  className="text-[#3483FA] hover:underline"
                >
                  {product.category.name}
                </Link>
              </div>
            )}

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
      {product.attributeGroups.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-medium text-black">Características</h2>
          <div className="space-y-2">
            {product.attributeGroups.map((group) => (
              <AttributeGroupSection
                key={group.groupId}
                group={group}
                isExpanded={expandedGroups.has(group.groupId)}
                onToggle={() => toggleGroup(group.groupId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AttributeGroupSectionProps {
  group: AttributeGroupValueDTO;
  isExpanded: boolean;
  onToggle: () => void;
}

function AttributeGroupSection({ group, isExpanded, onToggle }: AttributeGroupSectionProps) {
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-[#EBEBEB] px-4 py-3 text-left"
      >
        <span className="text-sm font-medium uppercase text-[#666666]">
          {group.groupName}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-[#666666]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#666666]" />
        )}
      </button>
      {isExpanded && (
        <div className="grid grid-cols-1 gap-px bg-gray-200 md:grid-cols-2">
          {group.attributes.map((attr, index) => (
            <div
              key={index}
              className="flex justify-between bg-white px-4 py-3"
            >
              <span className="text-sm text-[#666666]">{attr.displayName}</span>
              <span className="text-sm font-medium text-black">
                {attr.displayValue || '-'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
