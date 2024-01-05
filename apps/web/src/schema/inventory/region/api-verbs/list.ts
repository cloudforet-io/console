import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface RegionListParameters {
    query?: Query;
    region_id?: string;
    name?: string;
    region_key?: string;
    region_code?: string;
    provider?: string;
    workspace_id?: string;
}
