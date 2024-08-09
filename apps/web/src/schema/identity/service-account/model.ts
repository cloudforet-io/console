import type { Tags } from '@/schema/_common/model';
import type { ServiceAccountType } from '@/schema/identity/service-account/type';

export interface ServiceAccountModel {
    service_account_id: string;
    name: string;
    data: Record<string, any>;
    provider: string;
    app_id?: string;
    options?: Record<string, any>;
    tags: Tags;
    secret_schema_id: string;
    is_managed: boolean;
    reference_id: string;
    secret_id: string;
    trusted_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    last_synced_at: string;
    state: ServiceAccountType;
    // asset_info: ServiceAccountAssetInfoType;
    // cost_info: ServiceAccountCostInfoType;
}

