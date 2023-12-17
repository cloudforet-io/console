import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';


export interface RoleModel {
    role_id: string;
    name: string;
    role_type: RoleType;
    permissions: string[];
    page_access: string[];
    tags?: Tags;
    is_managed: boolean;
    created_at: TimeStamp;
    updated_at: TimeStamp;
}
