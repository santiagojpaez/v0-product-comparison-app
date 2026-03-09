import type {
  Category,
  Product,
  ProductListItem,
  PaginatedResponse,
  ComparisonRequest,
  ComparisonResponse,
} from './types';

const API_BASE = 'http://localhost:8080';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/api/categories');
}

export async function getCategory(id: string): Promise<Category> {
  return fetchApi<Category>(`/api/categories/${id}`);
}

export async function getCategoryProducts(
  categoryId: string,
  page: number = 0,
  size: number = 12
): Promise<PaginatedResponse<ProductListItem>> {
  return fetchApi<PaginatedResponse<ProductListItem>>(
    `/api/categories/${categoryId}/products?page=${page}&size=${size}`
  );
}

// Products
export async function getProduct(id: string): Promise<Product> {
  return fetchApi<Product>(`/api/products/${id}`);
}

export async function searchProducts(
  params: {
    categoryId?: string;
    q?: string;
    page?: number;
    size?: number;
  }
): Promise<PaginatedResponse<ProductListItem>> {
  const searchParams = new URLSearchParams();
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.q) searchParams.set('q', params.q);
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));
  
  return fetchApi<PaginatedResponse<ProductListItem>>(
    `/api/products/search?${searchParams.toString()}`
  );
}

// Comparisons
export async function compareProducts(request: ComparisonRequest): Promise<ComparisonResponse> {
  return fetchApi<ComparisonResponse>('/api/comparisons', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function compareProductsDiff(request: ComparisonRequest): Promise<ComparisonResponse> {
  return fetchApi<ComparisonResponse>('/api/comparisons/diff', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
