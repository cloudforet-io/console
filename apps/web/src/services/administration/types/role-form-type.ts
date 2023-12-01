import type { RoleType } from '@/schema/identity/role/type';


export interface BaseInfoFormData {
    roleName: string;
    roleDescription?: string;
    roleType: RoleType;
}
