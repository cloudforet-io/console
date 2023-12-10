import type { Tags } from '@/schema/_common/model';

export interface SecretUpdateParameters {
    secret_id: string;
    name?: string;
    tags?: Tags,
    project_id?: string,
    workspace_id?: string,
}
