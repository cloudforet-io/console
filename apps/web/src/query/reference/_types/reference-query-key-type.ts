import type { QueryContext } from '@/query/_types/query-key-type';
import type { ReferenceResourceType } from '@/query/reference/_types/reference-resource-type';


export type ReferenceQueryKey = [
    QueryContext,
    ReferenceResourceType
];
