import type { Tags } from '@/schema/_common/model';

export interface ServiceAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    trusted_account_id?: string;
    tags?: Tags;
    project_id?: string;
    workspace_id?: string;
    domain_id?: string;
}
