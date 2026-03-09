'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import type { CategoryTreeDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryTreeProps {
  categories: CategoryTreeDTO[];
}

export function CategoryTree({ categories }: CategoryTreeProps) {
  return (
    <div className="rounded-md bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-black">Categorías</h2>
      <ul className="space-y-1">
        {categories.map((category) => (
          <CategoryNode key={category.id} category={category} level={0} />
        ))}
      </ul>
    </div>
  );
}

interface CategoryNodeProps {
  category: CategoryTreeDTO;
  level: number;
}

function CategoryNode({ category, level }: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isLeaf = !hasChildren;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
        isLeaf
          ? 'cursor-pointer hover:bg-[#F7F7F7] text-[#3483FA]'
          : 'cursor-pointer hover:bg-[#F7F7F7] text-black'
      )}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={isLeaf ? undefined : handleClick}
    >
      {hasChildren ? (
        <>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0 text-[#FFE600]" />
          ) : (
            <Folder className="h-4 w-4 flex-shrink-0 text-[#FFE600]" />
          )}
        </>
      ) : (
        <span className="ml-4 h-4 w-4" />
      )}
      <span className="truncate">{category.name}</span>
    </div>
  );

  return (
    <li>
      {isLeaf ? (
        <Link href={`/category/${category.id}`}>{content}</Link>
      ) : (
        content
      )}
      {hasChildren && isExpanded && (
        <ul className="mt-1">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
