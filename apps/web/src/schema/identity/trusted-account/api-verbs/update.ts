import type { Tags } from '@/schema/_common/model';

export interface TrustedAccountUpdateParameters {
    trusted_account_id: string;
    name?: string;
    data?: any;
    tags?: Tags;
    workspace_id?: string;
    domain_id?: string;
}
