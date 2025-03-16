import type { QueryKeyBase } from '@/query/_types/query-key-type';
import { REFERENCE_PREFIX } from '@/query/reference/_constant/query-key-constant';
import type { ReferenceResourceType } from '@/query/reference/_types/reference-resource-type';


export type ReferenceQueryKey = [
    ...QueryKeyBase,
    typeof REFERENCE_PREFIX,
    ReferenceResourceType
];

// 명시적인 반환 타입 정의
export const getReferencePrimaryQueryKey = (resourceType: ReferenceResourceType): [typeof REFERENCE_PREFIX, ReferenceResourceType] => [
    REFERENCE_PREFIX,
    resourceType,
];
