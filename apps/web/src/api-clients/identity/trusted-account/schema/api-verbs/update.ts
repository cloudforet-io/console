import type { Tags } from '@/api-clients/_common/schema/model';
import type { AzureManagementGroupMappingType } from '@/api-clients/identity/trusted-account/schema/type';

export interface TrustedAccountUpdateParameters {
    trusted_account_id: string;
    name?: string;
    data?: Record<string, any>;
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
}
