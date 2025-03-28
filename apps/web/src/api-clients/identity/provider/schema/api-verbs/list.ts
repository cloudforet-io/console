import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ProviderListParameters {
    query?: Query;
    provider?: string;
    name?: string;
    alias?: string;
    is_managed?: boolean;
}
