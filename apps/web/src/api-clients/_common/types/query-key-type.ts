import type { API_DOC } from '@/api-clients/_common/constants/api-doc';
import type { SERVICE_PREFIX } from '@/api-clients/_common/constants/query-key-constant';
import type { QueryKeyBase } from '@/query/_types/query-key-type';



/**
 * Extracts all possible keys for `{service-name}`, `{resource-name}`, and `{verb}`
 */
export type ServiceName = keyof typeof API_DOC;
export type ResourceName<S extends ServiceName> = keyof (typeof API_DOC)[S];
export type Verb<S extends ServiceName, R extends ResourceName<S>> = Extract<(typeof API_DOC)[S][R], string[]>[number] | string;

export type ServiceQueryKey<S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>> = [
    ...QueryKeyBase,
    typeof SERVICE_PREFIX,
    S,
    R,
    V,
];
