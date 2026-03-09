'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  Truck,
  Check,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  GitCompare,
} from 'lucide-react';
import { compareProducts, compareProductsDiff } from '@/lib/api';
import type { 
  ComparisonDTO, 
  ComparisonDiffDTO, 
  ComparisonGroupDTO,
  ProductSummaryDTO 
} from '@/lib/types';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ComparisonPage() {
  const { products, removeProduct, clearProducts } = useComparison();
  const [comparisonData, setComparisonData] = useState<ComparisonDTO | ComparisonDiffDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diff mode toggle
  const [diffOnly, setDiffOnly] = useState(false);

  // Focused attributes
  const [focusedAttributeIds, setFocusedAttributeIds] = useState<number[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<number>>(new Set());

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const productIds = products.map((p) => p.id);

  const loadComparison = useCallback(async () => {
    if (productIds.length < 2) {
      setComparisonData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request = {
        productIds,
        focusedAttributeIds: focusedAttributeIds.length > 0 ? focusedAttributeIds : null,
      };

      const data = diffOnly
        ? await compareProductsDiff(request)
        : await compareProducts(request);

      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comparar productos');
    } finally {
      setIsLoading(false);
    }
  }, [productIds.join(','), focusedAttributeIds, diffOnly]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };

  const toggleDiffMode = () => {
    setDiffOnly(!diffOnly);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleFilterToggle = (attributeDefId: number) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(attributeDefId)) {
        next.delete(attributeDefId);
      } else {
        next.add(attributeDefId);
      }
      return next;
    });
  };

  const applyFilters = () => {
    setFocusedAttributeIds(Array.from(selectedFilters));
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setSelectedFilters(new Set());
    setFocusedAttributeIds([]);
  };

  // Get all available attributes for filtering
  const getAllAttributes = (): { id: number; name: string; groupName: string }[] => {
    if (!comparisonData) return [];
    const attrs: { id: number; name: string; groupName: string }[] = [];
    comparisonData.attributeGroups.forEach((group) => {
      group.attributes.forEach((attr) => {
        attrs.push({ id: attr.attributeDefId, name: attr.displayName, groupName: group.groupName });
      });
    });
    return attrs;
  };

  // Check if we have missing attributes (only in full comparison mode)
  const hasMissingAttributes = !diffOnly && 
    comparisonData && 
    'missingAttributes' in comparisonData && 
    comparisonData.missingAttributes.length > 0;

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md bg-white p-8 text-center">
        <GitCompare className="mb-4 h-16 w-16 text-[#999999]" />
        <h1 className="text-xl font-medium text-black">No hay productos para comparar</h1>
        <p className="mt-2 text-sm text-[#999999]">
          Agregá productos desde el catálogo para comenzar a comparar
        </p>
        <Link href="/">
          <Button className="mt-4 bg-[#FFE600] text-black hover:bg-[#FFD000]">
            Explorar categorías
          </Button>
        </Link>
      </div>
    );
  }

  if (products.length === 1) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md bg-white p-8 text-center">
        <GitCompare className="mb-4 h-16 w-16 text-[#999999]" />
        <h1 className="text-xl font-medium text-black">Necesitás al menos 2 productos</h1>
        <p className="mt-2 text-sm text-[#999999]">
          Agregá otro producto para poder comparar
        </p>
        <Link href="/">
          <Button className="mt-4 bg-[#FFE600] text-black hover:bg-[#FFD000]">
            Agregar más productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-black">Comparación de productos</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={clearProducts}
          className="border-gray-300 text-[#666666] hover:bg-[#F7F7F7]"
        >
          Limpiar comparación
        </Button>
      </div>

      {/* Missing Attributes Banner */}
      {hasMissingAttributes && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Algunos atributos no están disponibles</p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                {(comparisonData as ComparisonDTO).missingAttributes.map((missing, idx) => (
                  <li key={idx}>
                    <strong>{missing.attributeDisplayName}</strong>: falta en {missing.productName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Product Header Cards */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: `${products.length * 200 + 150}px` }}>
          {/* Empty cell for attribute names column */}
          <div className="w-36 flex-shrink-0" />

          {/* Product cards */}
          {comparisonData?.products.map((product) => (
            <ProductHeaderCard
              key={product.id}
              product={product}
              onRemove={() => handleRemoveProduct(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Diff Toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={diffOnly}
            onChange={toggleDiffMode}
            className="h-4 w-4 rounded border-gray-300 text-[#3483FA] focus:ring-[#3483FA]"
          />
          <span className="text-sm text-black">Solo diferencias</span>
        </label>

        {/* Filter Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="gap-1 border-gray-300 text-black hover:bg-[#F7F7F7]"
        >
          <Filter className="h-4 w-4" />
          Filtrar atributos
          {focusedAttributeIds.length > 0 && (
            <span className="ml-1 rounded-full bg-[#3483FA] px-2 py-0.5 text-xs text-white">
              {focusedAttributeIds.length}
            </span>
          )}
        </Button>

        {focusedAttributeIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-[#3483FA] hover:bg-[#F7F7F7]"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="mb-6 rounded-md bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-medium text-black">Filtrar por atributos</h3>
          <div className="mb-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {getAllAttributes().map((attr) => (
                <label
                  key={attr.id}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-[#F7F7F7]"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.has(attr.id)}
                    onChange={() => handleFilterToggle(attr.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#3483FA] focus:ring-[#3483FA]"
                  />
                  <span className="text-sm text-black">{attr.name}</span>
                  <span className="text-xs text-[#999999]">({attr.groupName})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              className="bg-[#FFE600] text-black hover:bg-[#FFD000]"
              size="sm"
            >
              Aplicar foco
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(false)}
              className="border-gray-300 text-black hover:bg-[#F7F7F7]"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-white p-8 text-center">
          <p className="text-[#F23D4F]">{error}</p>
          <Button
            onClick={loadComparison}
            className="mt-4 bg-[#FFE600] text-black hover:bg-[#FFD000]"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Comparison Table */}
      {comparisonData && !isLoading && (
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${products.length * 200 + 150}px` }}>
            {comparisonData.attributeGroups.map((group) => (
              <AttributeGroupSection
                key={group.groupName}
                group={group}
                products={comparisonData.products}
                isCollapsed={collapsedGroups.has(group.groupName)}
                onToggle={() => toggleGroup(group.groupName)}
                focusedAttributeIds={focusedAttributeIds}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductHeaderCardProps {
  product: ProductSummaryDTO;
  onRemove: () => void;
}

function ProductHeaderCard({ product, onRemove }: ProductHeaderCardProps) {
  return (
    <div className="relative w-48 flex-shrink-0 rounded-md border-b-4 border-[#FFE600] bg-white p-4 shadow-sm">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label={`Quitar ${product.name}`}
      >
        <X className="h-4 w-4" />
      </button>

      <Link href={`/product/${product.id}`} className="block">
        <div className="relative mx-auto mb-3 h-24 w-24">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-black">
          {product.name}
        </h3>

        <p className="mb-2 text-lg font-semibold text-black">
          {product.price.currency} {product.price.amount.toLocaleString()}
        </p>

        {product.rating !== null && (
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-3 w-3',
                  star <= Math.round(product.rating!)
                    ? 'fill-[#FFE600] text-[#FFE600]'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
        )}

        {product.shipping.freeShipping && (
          <div className="flex items-center gap-1 text-xs text-[#00A650]">
            <Truck className="h-3 w-3" />
            <span>Envío gratis</span>
          </div>
        )}
      </Link>
    </div>
  );
}

interface AttributeGroupSectionProps {
  group: ComparisonGroupDTO;
  products: ProductSummaryDTO[];
  isCollapsed: boolean;
  onToggle: () => void;
  focusedAttributeIds: number[];
}

function AttributeGroupSection({
  group,
  products,
  isCollapsed,
  onToggle,
  focusedAttributeIds,
}: AttributeGroupSectionProps) {
  // Sort attributes: focused ones first
  const sortedAttributes = [...group.attributes].sort((a, b) => {
    const aFocused = focusedAttributeIds.includes(a.attributeDefId);
    const bFocused = focusedAttributeIds.includes(b.attributeDefId);
    if (aFocused && !bFocused) return -1;
    if (!aFocused && bFocused) return 1;
    return 0;
  });

  return (
    <div className="mb-2 overflow-hidden rounded-md bg-white shadow-sm">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-[#EBEBEB] px-4 py-3"
      >
        <span className="text-sm font-medium uppercase text-[#666666]">{group.groupName}</span>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-[#666666]" />
        ) : (
          <ChevronUp className="h-4 w-4 text-[#666666]" />
        )}
      </button>

      {/* Attributes */}
      {!isCollapsed && (
        <div>
          {sortedAttributes.map((attr, index) => {
            const isFocused = focusedAttributeIds.includes(attr.attributeDefId);

            return (
              <div
                key={attr.attributeDefId}
                className={cn(
                  'flex',
                  index % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F7]',
                  isFocused && 'border-l-4 border-[#3483FA] bg-blue-50'
                )}
              >
                {/* Attribute Name */}
                <div className="w-36 flex-shrink-0 px-4 py-3">
                  <span className="text-sm text-[#666666]">{attr.displayName}</span>
                </div>

                {/* Values */}
                {products.map((product) => {
                  const value = attr.values.find((v) => v.productId === product.id);
                  const isWinner = attr.highlight?.winnerIds.includes(product.id) ?? false;
                  const hasValue = value?.displayValue !== null && value?.displayValue !== undefined;

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        'w-48 flex-shrink-0 px-4 py-3',
                        isWinner && 'border-l-4 border-[#00A650] bg-[#F0FFF4]'
                      )}
                    >
                      {hasValue ? (
                        <div className="flex items-center gap-1">
                          {isWinner && (
                            <Check className="h-3 w-3 flex-shrink-0 text-[#00A650]" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              isWinner ? 'font-bold text-[#00A650]' : 'text-black'
                            )}
                          >
                            {value?.displayValue}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="text-sm text-[#999999]"
                          title="Dato no disponible"
                        >
                          -
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
