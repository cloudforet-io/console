import type { Tags } from '@/schema/_common/model';

export interface TrustedAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    tags?: Tags;
    permission_group: 'DOMAIN' | 'WORKSPACE';
    workspace_id?: string;
    domain_id?: string;
}
