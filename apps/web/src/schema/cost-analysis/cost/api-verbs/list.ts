import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CostListParameters {
    query?: Query;
    data_source_id:string;
    cost_id?:string;
    provider?:string;
    region_code?:string;
    region_key?:string;
    product?:string;
    usage_type?:string;
    resource?:string;
    billed_year?:string;
    billed_month?:string;
    billed_date?:string;
    workspace_id?:string;
    service_account_id?:string;
    project_id?:string;
}
