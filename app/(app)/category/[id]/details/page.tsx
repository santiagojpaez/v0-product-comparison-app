'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Asterisk,
  Info,
  Folder,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getCategory } from '@/lib/api';
import type { CategoryDetailDTO, ComparisonStrategy, AttributeDataType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = use(params);
  const categoryId = Number(id);
  const [category, setCategory] = useState<CategoryDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategory() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCategory(categoryId);
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la categoría');
      } finally {
        setIsLoading(false);
      }
    }
    loadCategory();
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFE600] border-t-transparent" />
      </div>
    );
  }

  if (error || !category) {
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

  const strategyConfig: Record<ComparisonStrategy, { icon: typeof ArrowUp; label: string; className: string }> = {
    HIGHER_IS_BETTER: {
      icon: ArrowUp,
      label: 'Mayor es mejor',
      className: 'text-[#00A650]',
    },
    LOWER_IS_BETTER: {
      icon: ArrowDown,
      label: 'Menor es mejor',
      className: 'text-[#3483FA]',
    },
    NEUTRAL: {
      icon: Minus,
      label: 'Neutral',
      className: 'text-[#666666]',
    },
  };

  const dataTypeLabels: Record<AttributeDataType, string> = {
    NUMBER: 'Número',
    TEXT: 'Texto',
    BOOLEAN: 'Sí/No',
    ENUM: 'Enumeración',
    LIST: 'Lista',
    RANGE: 'Rango',
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-[#999999]">
        <Link href="/" className="hover:text-[#3483FA]">
          Inicio
        </Link>
        <ChevronRight className="h-4 w-4" />
        {category.parent && (
          <>
            <Link href={`/category/${category.parent.id}`} className="hover:text-[#3483FA]">
              {category.parent.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <Link href={`/category/${categoryId}`} className="hover:text-[#3483FA]">
          {category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">Detalles</span>
      </div>

      {/* Header */}
      <div className="mb-6 rounded-md bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#FFE600] p-3">
            <Folder className="h-6 w-6 text-black" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-black">{category.name}</h1>

            {/* Parent Category */}
            {category.parent && (
              <p className="mt-2 text-sm text-[#666666]">
                Categoría padre:{' '}
                <Link
                  href={`/category/${category.parent.id}/details`}
                  className="text-[#3483FA] hover:underline"
                >
                  {category.parent.name}
                </Link>
              </p>
            )}
          </div>
          <Link href={`/category/${categoryId}`}>
            <Button className="bg-[#FFE600] text-black hover:bg-[#FFD000]">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>

      {/* Comparable Categories */}
      {category.comparableWith && category.comparableWith.length > 0 && (
        <div className="mb-6 rounded-md bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-black">Categorías comparables</h2>
          <div className="flex flex-wrap gap-2">
            {category.comparableWith.map((comp) => (
              <Link
                key={comp.id}
                href={`/category/${comp.id}/details`}
                className="rounded-full bg-[#F7F7F7] px-4 py-2 text-sm text-[#3483FA] transition-colors hover:bg-[#EBEBEB]"
              >
                {comp.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Attribute Groups */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-black">Grupos de atributos</h2>

        {category.attributeGroups && category.attributeGroups.length > 0 ? (
          <div className="space-y-6">
            {category.attributeGroups
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((group) => (
              <div key={group.groupId}>
                <h3 className="mb-3 text-sm font-medium uppercase text-[#666666]">
                  {group.groupName}
                </h3>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F7F7F7]">
                        <th className="px-4 py-2 text-left text-sm font-medium text-[#666666]">
                          Atributo
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-[#666666]">
                          Tipo de dato
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-[#666666]">
                          Requerido
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-[#666666]">
                          Comparable
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-[#666666]">
                          Estrategia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.attributes
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((attr, index) => {
                          const strategy = strategyConfig[attr.attributeDefinition.comparisonStrategy];
                          const StrategyIcon = strategy.icon;

                          return (
                            <tr
                              key={attr.canonicalName}
                              className={cn(
                                index % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F7]'
                              )}
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <span className="text-sm text-black">{attr.displayName}</span>
                                  {attr.attributeDefinition.description && (
                                    <p className="mt-0.5 text-xs text-[#999999]">
                                      {attr.attributeDefinition.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-[#666666]">
                                {dataTypeLabels[attr.dataType]}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {attr.isRequired ? (
                                  <CheckCircle className="inline h-4 w-4 text-[#00A650]" />
                                ) : (
                                  <XCircle className="inline h-4 w-4 text-[#999999]" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {attr.isComparable ? (
                                  <CheckCircle className="inline h-4 w-4 text-[#00A650]" />
                                ) : (
                                  <XCircle className="inline h-4 w-4 text-[#999999]" />
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <StrategyIcon
                                    className={cn('h-4 w-4', strategy.className)}
                                  />
                                  <span className="text-sm text-[#666666]">
                                    {strategy.label}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#999999]">
            Esta categoría no tiene atributos definidos.
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-md bg-[#F7F7F7] p-4">
        <h3 className="mb-3 text-sm font-medium text-[#666666]">Leyenda</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#00A650]" />
            <span className="text-[#666666]">Requerido / Comparable</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#999999]" />
            <span className="text-[#666666]">Opcional / No comparable</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-[#00A650]" />
            <span className="text-[#666666]">Mayor valor es mejor</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-[#3483FA]" />
            <span className="text-[#666666]">Menor valor es mejor</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-[#666666]" />
            <span className="text-[#666666]">Comparación neutral</span>
          </div>
        </div>
      </div>
    </div>
  );
}
