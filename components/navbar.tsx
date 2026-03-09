'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, GitCompare } from 'lucide-react';
import { useComparison } from '@/lib/comparison-context';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const { products } = useComparison();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FFE600]">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold text-black">CompareML</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl">
          <div className="flex w-full overflow-hidden rounded-full bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos, marcas y más..."
              className="flex-1 px-4 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-white px-4 hover:bg-gray-50"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </form>

        {/* Comparison Cart */}
        <Link href="/comparison" className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-black hover:bg-[#FFD000]"
          >
            <GitCompare className="h-5 w-5" />
            <span className="hidden sm:inline">Comparar</span>
            {products.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3483FA] text-xs font-bold text-white">
                {products.length}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
