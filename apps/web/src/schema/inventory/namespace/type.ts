import type { NAMESPACE_CATEGORY } from '@/schema/inventory/namespace/constant';

export type NamespaceCategory = typeof NAMESPACE_CATEGORY[keyof typeof NAMESPACE_CATEGORY];

export type NamespaceGroup = 'Common' | 'AWS' | 'Azure' | 'Google Cloud' | 'Kubernetes';
