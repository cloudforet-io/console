import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserModel } from '@/api-clients/identity/user/schema/model';

type RoleBindingType = {
    type: RoleType;
    name: string;
};

export type UserInfoType = Partial<UserModel> & {
    role_binding?: RoleBindingType
};
