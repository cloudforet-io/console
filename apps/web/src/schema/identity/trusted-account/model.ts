import type { Tags } from '@/schema/_common/model';

export interface TrustedAccountModel {
    trusted_account_id: string;
    name: string;
    data: {
        [key: string]: string;
    },
    provider: string;
    tags: Tags;
    permission_group: 'DOMAIN' | 'WORKSPACE';
    workspace_id?: string;
    created_at?: string;
}


