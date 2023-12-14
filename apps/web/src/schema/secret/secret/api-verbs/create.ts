import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface SecretCreateParameters {
    name: string;
    data: Record<string, any>
    tags?: Tags,
    schema_id?: string,
    service_account_id?: string,
    trusted_secret_id?: string,
    permission_group: ResourceGroup,
    project_id?: string,
    workspace_id?: string,
}
