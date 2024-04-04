import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EndpointModel } from '@/schema/identity/endpoint/model';

export interface EndpointListParameters {
    service?: string;
    query?: Query;
}

export interface EndpointListResponse {
    results: EndpointModel[];
    total_count: number;
}
