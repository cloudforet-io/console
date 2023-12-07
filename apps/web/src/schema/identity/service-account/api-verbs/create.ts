import type { Tags } from '@/schema/_common/model';

export interface ServiceAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    workspace_id?: string;
    project_id: string;
    tags?: Tags;
    trusted_account_id?: string;
}
