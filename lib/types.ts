// API Types matching exact backend spec

// === ENUMS ===
export type ItemCondition = 'NEW' | 'USED' | 'REFURBISHED';
export type AttributeDataType = 'NUMBER' | 'TEXT' | 'BOOLEAN' | 'ENUM' | 'LIST' | 'RANGE';
export type ComparisonStrategy = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'NEUTRAL';

// === ERROR ===
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// === SHARED TYPES ===
export interface CategorySummaryDTO {
  id: number;
  name: string;
}

export interface PriceSummaryDTO {
  amount: number;
  originalAmount: number | null;
  currency: string;
}

export interface ShippingSummaryDTO {
  freeShipping: boolean;
  storePickup: boolean;
}

export interface ProductSummaryDTO {
  id: string;
  name: string;
  description: string | null;
  condition: ItemCondition;
  imageUrl: string | null;
  color: string | null;
  rating: number | null;
  price: PriceSummaryDTO;
  shipping: ShippingSummaryDTO;
}

// === PAGINATION ===
export interface PageSort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: PageSort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort: PageSort;
  pageable: Pageable;
}

// === ENDPOINT 1: GET /api/categories ===
export interface CategoryTreeDTO {
  id: number;
  name: string;
  children: CategoryTreeDTO[];
}

// === ENDPOINT 2: GET /api/categories/{id} ===
export interface AttributeDefinitionSummaryDTO {
  displayName: string;
  description: string | null;
  dataType: AttributeDataType;
  comparisonStrategy: ComparisonStrategy;
}

export interface AttributeRuleSummaryDTO {
  canonicalName: string;
  displayName: string;
  dataType: AttributeDataType;
  isRequired: boolean;
  isComparable: boolean;
  displayOrder: number;
  attributeDefinition: AttributeDefinitionSummaryDTO;
}

export interface AttributeGroupDTO {
  groupId: number;
  groupName: string;
  displayOrder: number;
  attributes: AttributeRuleSummaryDTO[];
}

export interface CategoryDetailDTO {
  id: number;
  name: string;
  parent: CategorySummaryDTO | null;
  comparableWith: CategorySummaryDTO[];
  attributeGroups: AttributeGroupDTO[];
}

// === ENDPOINT 6: GET /api/products/{id} ===
export interface AttributeValueDisplayDTO {
  displayName: string;
  displayValue: string;
}

export interface AttributeGroupValueDTO {
  groupId: number;
  groupName: string;
  attributes: AttributeValueDisplayDTO[];
}

export interface ProductDetailDTO {
  productSummary: ProductSummaryDTO;
  weight: number | null;
  size: string | null;
  availableQuantity: number | null;
  soldQuantity: number | null;
  category: CategorySummaryDTO | null;
  attributeGroups: AttributeGroupValueDTO[];
}

// === ENDPOINT 8: POST /api/comparisons ===
export interface ComparisonRequestDTO {
  productIds: string[];
  focusedAttributeIds: number[] | null;
}

export interface AttributeValueDTO {
  productId: string;
  displayValue: string | null;
  normalizedValue: number | null;
}

export interface HighlightDTO {
  winnerIds: string[];
  winnerDisplayValue: string;
  reason: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
}

export interface ComparisonAttributeDTO {
  attributeDefId: number;
  displayName: string;
  values: AttributeValueDTO[];
  highlight: HighlightDTO | null;
}

export interface ComparisonGroupDTO {
  groupName: string;
  groupOrder: number;
  attributes: ComparisonAttributeDTO[];
}

export interface MissingAttributeDTO {
  productId: string;
  productName: string;
  attributeDisplayName: string;
}

export interface ComparisonDTO {
  products: ProductSummaryDTO[];
  attributeGroups: ComparisonGroupDTO[];
  missingAttributes: MissingAttributeDTO[];
}

// === ENDPOINT 9: POST /api/comparisons/diff ===
export interface ComparisonDiffDTO {
  products: ProductSummaryDTO[];
  attributeGroups: ComparisonGroupDTO[];
}
