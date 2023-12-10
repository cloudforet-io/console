import type { Tags } from '@/schema/_common/model';
import type { PermissionGroup } from '@/schema/identity/role-binding/type';

export interface SecretCreateParameters {
    name: string;
    data: Record<string, any>
    tags?: Tags,
    schema_id?: string,
    service_account_id?: string,
    trusted_secret_id?: string,
    permission_group: PermissionGroup,
    project_id?: string,
    workspace_id?: string,
}
