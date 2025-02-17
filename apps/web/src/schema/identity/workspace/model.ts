import type { Tags } from '@/api-clients/_common/schema/model';

export type WorkspaceState = 'ENABLED' | 'DISABLED' | 'DORMANT';

export interface WorkspaceModel {
    workspace_id: string;
    name: string;
    state: WorkspaceState;
    packages: string[];
    tags: Tags;
    is_managed?: boolean;
    reference_id?: string;
    trusted_account_id?: string;
    created_by: string;
    domain_id: string;
    created_at: string;
    role_id?: string;
    role_type?: string;
    role_name?: string;
    is_dormant?: boolean;
    dormant_ttl?: number;
    service_account_count?: number;
    cost_info?: {
        month: number;
        day: number;
    };
    dormant_updated_at?: string;
    workspace_group_id?: string;
    user_count?: number;
}
