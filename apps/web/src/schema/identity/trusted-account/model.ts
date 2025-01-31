import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

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


