import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

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
    };
    plugin_options?: Record<string, any>;
    tags?: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id?: string;
}
