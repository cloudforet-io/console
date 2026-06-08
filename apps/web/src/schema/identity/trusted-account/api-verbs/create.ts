import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { AzureManagementGroupMappingType } from '@/schema/identity/trusted-account/type';

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
