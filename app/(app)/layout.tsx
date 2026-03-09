import { ComparisonProvider } from '@/lib/comparison-context';
import { Navbar } from '@/components/navbar';
import { FloatingComparisonCart } from '@/components/floating-comparison-cart';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-[#EBEBEB]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
        <FloatingComparisonCart />
      </div>
    </ComparisonProvider>
  );
}
