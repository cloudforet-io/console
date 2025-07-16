import type { NAMESPACE_CATEGORY } from '@/api-clients/inventory-v2/namespace/schema/constant';

export type NamespaceCategory = typeof NAMESPACE_CATEGORY[keyof typeof NAMESPACE_CATEGORY];
