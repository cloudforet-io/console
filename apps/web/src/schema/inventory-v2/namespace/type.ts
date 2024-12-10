import type { NAMESPACE_CATEGORY } from '@/schema/inventory-v2/namespace/constant';

export type NamespaceCategory = typeof NAMESPACE_CATEGORY[keyof typeof NAMESPACE_CATEGORY];
