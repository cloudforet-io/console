import type { Tags } from '@/schema/_common/model';

export interface TrustedSecretUpdateParameters {
    trusted_secret_id: string;
    name?: string;
    tags?: Tags,
    workspace_id?: string,
}
