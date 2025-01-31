import type { Tags } from '@/api-clients/_common/schema/model';

export interface TrustedSecretUpdateParameters {
    trusted_secret_id: string;
    name?: string;
    tags?: Tags,
}
