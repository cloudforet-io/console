import type { Tags } from '@/api-clients/_common/schema/model';
import type { ServiceAccountType } from '@/api-clients/identity/service-account/schema/type';

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
    service_account_mgr_id: string;
    // asset_info: ServiceAccountAssetInfoType;
    // cost_info: ServiceAccountCostInfoType;
}

