import type { Tags } from '@/schema/_common/model';

export interface CostModel {
    cost_id: string;
    cost: number;
    usage_quantity: number;
    usage_unit: string;
    provider: string;
    region_code: string;
    region_key: string;
    product: string;
    usage_type: string;
    resource: string;
    tags: Tags;
    additional_info: object;
    data_source_id: string;
    service_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    billed_year: string;
    billed_month: string;
    billed_date: string;
}
