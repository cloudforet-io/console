import type { Tags } from '@/schema/_common/model';

export interface TrustedAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    permission_group: 'DOMAIN' | 'WORKSPACE';
    tags?: Tags;
    workspace_id?: string;
}
