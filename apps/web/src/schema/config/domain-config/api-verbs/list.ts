import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ListDomainConfigParameters {
    name?: string;
    query?: Query;
}
