import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { AzureManagementGroupMappingType } from '@/api-clients/identity/trusted-account/schema/type';

export interface TrustedAccountCreateParameters {
    name: string;
    data: Record<string, any>;
    provider: string;
    secret_schema_id: string;
    secret_data: Record<string, any>;
    schedule?: {
        state: 'ENABLED' | 'DISABLED';
        hours: number[];
    };
    sync_options?: {
        skip_project_group: boolean;
        single_workspace_id: string;
        azure_management_group_mapping_type?: AzureManagementGroupMappingType; // only for Azure
    };
    plugin_options?: Record<string, any>;
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id?: string;
}
