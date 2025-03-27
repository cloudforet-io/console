import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { DomainState } from '@/schema/identity/domain/constant';
import type { DomainModel } from '@/schema/identity/domain/model';

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
