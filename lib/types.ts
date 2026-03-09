// API Types for CompareML

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
  comparableCategories: { id: string; name: string }[];
  attributeGroups: AttributeGroup[];
}

export interface AttributeGroup {
  id: string;
  name: string;
  attributes: AttributeDefinition[];
}

export interface AttributeDefinition {
  id: string;
  name: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN';
  required: boolean;
  comparisonStrategy: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'NEUTRAL';
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  price: number;
  currency: string;
  originalAmount?: number;
  rating: number;
  ratingCount: number;
  freeShipping: boolean;
  stock: number;
  unitsSold: number;
  category: {
    id: string;
    name: string;
  };
  attributes: ProductAttribute[];
}

export interface ProductAttribute {
  attributeId: string;
  name: string;
  value: string | number | boolean | null;
  displayValue: string;
  groupId: string;
  groupName: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  imageUrl: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  price: number;
  currency: string;
  originalAmount?: number;
  rating: number;
  ratingCount: number;
  freeShipping: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ComparisonRequest {
  productIds: string[];
  focusedAttributeIds: string[];
}

export interface ComparisonResponse {
  products: ComparisonProduct[];
  attributeGroups: ComparisonAttributeGroup[];
  missingAttributes: MissingAttribute[];
}

export interface ComparisonProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  currency: string;
  rating: number;
  freeShipping: boolean;
}

export interface ComparisonAttributeGroup {
  id: string;
  name: string;
  attributes: ComparisonAttribute[];
}

export interface ComparisonAttribute {
  id: string;
  name: string;
  focused: boolean;
  values: ComparisonValue[];
}

export interface ComparisonValue {
  productId: string;
  value: string | number | boolean | null;
  displayValue: string | null;
  highlight: boolean;
}

export interface MissingAttribute {
  attributeId: string;
  attributeName: string;
  productIds: string[];
}
