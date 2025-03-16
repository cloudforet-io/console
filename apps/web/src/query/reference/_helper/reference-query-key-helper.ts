import { REFERENCE_PREFIX } from '@/query/reference/_constant/query-key-constant';
import type { ReferenceResourceType } from '@/query/reference/_types/reference-resource-type';

export const getReferencePrimaryQueryKey = (resourceType: ReferenceResourceType): [typeof REFERENCE_PREFIX, ReferenceResourceType] => [
    REFERENCE_PREFIX,
    resourceType,
];
