import type {
  CategoryTreeDTO,
  CategoryDetailDTO,
  AttributeGroupDTO,
  CategorySummaryDTO,
  ProductSummaryDTO,
  ProductDetailDTO,
  Page,
  ComparisonRequestDTO,
  ComparisonDTO,
  ComparisonDiffDTO,
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// === ENDPOINT 1: GET /api/categories ===
export async function getCategories(): Promise<CategoryTreeDTO[]> {
  return fetchApi<CategoryTreeDTO[]>('/api/categories');
}

// === ENDPOINT 2: GET /api/categories/{id} ===
export async function getCategory(id: number): Promise<CategoryDetailDTO> {
  return fetchApi<CategoryDetailDTO>(`/api/categories/${id}`);
}

// === ENDPOINT 3: GET /api/categories/{id}/attributes ===
export async function getCategoryAttributes(id: number): Promise<AttributeGroupDTO[]> {
  return fetchApi<AttributeGroupDTO[]>(`/api/categories/${id}/attributes`);
}

// === ENDPOINT 4: GET /api/categories/{id}/comparable-categories ===
export async function getComparableCategories(id: number): Promise<CategorySummaryDTO[]> {
  return fetchApi<CategorySummaryDTO[]>(`/api/categories/${id}/comparable-categories`);
}

// === ENDPOINT 5: GET /api/categories/{id}/products ===
export async function getCategoryProducts(
  categoryId: number,
  page: number = 0,
  size: number = 10,
  sort: string = 'id,asc'
): Promise<Page<ProductSummaryDTO>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });
  return fetchApi<Page<ProductSummaryDTO>>(
    `/api/categories/${categoryId}/products?${params.toString()}`
  );
}

// === ENDPOINT 6: GET /api/products/{id} ===
export async function getProduct(id: string): Promise<ProductDetailDTO> {
  return fetchApi<ProductDetailDTO>(`/api/products/${id}`);
}

// === ENDPOINT 7: GET /api/products/search ===
export async function searchProducts(params: {
  categoryId: number;
  q: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Page<ProductSummaryDTO>> {
  const searchParams = new URLSearchParams({
    categoryId: String(params.categoryId),
    q: params.q,
  });
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);
  
  return fetchApi<Page<ProductSummaryDTO>>(
    `/api/products/search?${searchParams.toString()}`
  );
}

// === ENDPOINT 8: POST /api/comparisons ===
export async function compareProducts(request: ComparisonRequestDTO): Promise<ComparisonDTO> {
  return fetchApi<ComparisonDTO>('/api/comparisons', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// === ENDPOINT 9: POST /api/comparisons/diff ===
export async function compareProductsDiff(request: ComparisonRequestDTO): Promise<ComparisonDiffDTO> {
  return fetchApi<ComparisonDiffDTO>('/api/comparisons/diff', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
