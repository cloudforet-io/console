import type { API_DOC } from '@/api-clients/_common/constants/api-doc-constant';


export type QueryKeyArray = readonly unknown[];

export type QueryScope = 'service' | 'reference';



/**
 * Extracts all possible keys for `{service-name}`, `{resource-name}`, and `{verb}`
 */
export type ServiceName = keyof typeof API_DOC;
export type ResourceName<S extends ServiceName> = keyof (typeof API_DOC)[S];
export type Verb<S extends ServiceName, R extends ResourceName<S>> = Extract<(typeof API_DOC)[S][R], string[]>[number] | string;
