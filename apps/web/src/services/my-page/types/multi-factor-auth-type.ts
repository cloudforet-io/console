import type { RoleType } from '@/schema/identity/role/type';
import type { UserModel } from '@/schema/identity/user/model';

type RoleBindingType = {
    type: RoleType;
    name: string;
};

export type UserInfoType = Partial<UserModel> & {
    role_binding?: RoleBindingType
};
