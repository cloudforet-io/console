import type { Tags } from '@/api-clients/_common/schema/model';

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
    };
    plugin_options?: Record<string, any>;
    tags?: Tags;
}
