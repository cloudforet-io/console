
import type { API_DOC } from '@/api-clients/_common/constants/api-doc';
import type { API_QUERY_KEY_MAP } from '@/api-clients/_common/constants/api-query-key-map-constant';



/**
 * Extracts all possible keys for `{service-name}`, `{resource-name}`, and `{verb}`
 */
export type ServiceName = keyof typeof API_DOC;
export type ResourceName<S extends ServiceName> = keyof (typeof API_DOC)[S];
export type Verb<S extends ServiceName, R extends ResourceName<S>> = Extract<(typeof API_DOC)[S][R], string[]>[number] | string;

export type ServiceQueryKey<S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>> = [
    S,
    R,
    V,
];

export type APIQueryKeyMapService = keyof typeof API_QUERY_KEY_MAP;
export type APIQueryKeyMapResource<S extends APIQueryKeyMapService> = keyof (typeof API_QUERY_KEY_MAP)[S];
export type APIQueryKeyMapVerb<S extends APIQueryKeyMapService, R extends APIQueryKeyMapResource<S>> = keyof (typeof API_QUERY_KEY_MAP)[S][R];
