import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface PublicConfigListParameters {
    domain_id: string;
    query?: Query;
    name?: string;
}
