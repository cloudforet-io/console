import type { ReferenceResourceType } from './type';

export const REFERENCE_PREFIX = 'reference' as const;

export const getReferencePrimaryQueryKey = (resourceType: ReferenceResourceType) => [
    REFERENCE_PREFIX,
    resourceType,
];
