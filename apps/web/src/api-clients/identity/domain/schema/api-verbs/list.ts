import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { DomainState } from '@/api-clients/identity/domain/schema/constant';
import type { DomainModel } from '@/api-clients/identity/domain/schema/model';

export interface DomainListParameters {
    name?: string;
    state?: DomainState;
    domain_id?: string;
    query?: Query;
}

export interface DomainListResponse {
    results: DomainModel[];
    total_count: number;
}
