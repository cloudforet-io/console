import type { REFERENCE_TYPE_MAP } from '@/query/reference/_constants/reference-type-map';


export type ReferenceResourceType = typeof REFERENCE_TYPE_MAP[keyof typeof REFERENCE_TYPE_MAP];
