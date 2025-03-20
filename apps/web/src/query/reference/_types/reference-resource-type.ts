import type { REFERENCE_TYPE_INFO_MAP } from '@/query/reference/_constants/reference-type-map';


export type ReferenceResourceType = typeof REFERENCE_TYPE_INFO_MAP[keyof typeof REFERENCE_TYPE_INFO_MAP];
