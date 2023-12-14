import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface TrustedSecretModel {
    trusted_secret_id: string;
    name: string;
    tags: Tags;
    schema_id: string;
    provider: string;
    trusted_account_id: string;
    permission_group: ResourceGroup;
    workspace_id: string;
    created_at: TimeStamp;
}
