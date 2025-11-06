import type { Tags } from '@/schema/_common/model';

import type { ProjectGroupMappingType, WorkspaceMappingType } from '@/services/asset-inventory/types/service-account-page-type';

export interface TrustedAccountUpdateParameters {
    trusted_account_id: string;
    name?: string;
    data?: Record<string, any>;
    schedule?: {
        state: 'ENABLED' | 'DISABLED';
        hours: number[];
    };
    sync_options?: {
        workspace_mapping_type: WorkspaceMappingType;
        project_group_mapping_type: ProjectGroupMappingType;
        custom_depth: number;
        single_workspace_id: string;
    };
    plugin_options?: Record<string, any>;
    tags?: Tags;
}
