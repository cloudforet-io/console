import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EndpointModel } from '@/api-clients/identity/endpoint/schema/model';

export interface EndpointListParameters {
    service?: string;
    query?: Query;
}

export interface EndpointListResponse {
    results: EndpointModel[];
    total_count: number;
}
