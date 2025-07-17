import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { AzureManagementGroupMappingType } from '@/api-clients/identity/trusted-account/schema/type';

export interface TrustedAccountModel {
    trusted_account_id: string;
    name: string;
    data: Record<string, any>;
    provider: string;
    schedule?: {
        state: 'ENABLED' | 'DISABLED';
        hours: number[];
    };
    sync_options?: {
        skip_project_group: boolean;
        single_workspace_id: string;
        use_management_group_as_workspace?: boolean; // only for Azure
        azure_management_group_mapping_type?: AzureManagementGroupMappingType; // only for Azure
    };
    plugin_options?: Record<string, any>;
    tags: Tags;
    secret_schema_id: string;
    trusted_secret_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}


