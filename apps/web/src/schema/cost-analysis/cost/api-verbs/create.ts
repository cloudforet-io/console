import type { Tags } from '@/schema/_common/model';

export interface CostCreateParameters {
    cost:string;
    usage_quantity?:number;
    usage_unit?:string;
    provider?:string;
    region_code?:string;
    product?:string;
    usage_type?:string;
    resource?:string;
    tags?:Tags;
    additional_info?:object;
    data_source_id:string;
    billed_date:string;
    service_account_id?:string;
    project_id:string;
}
