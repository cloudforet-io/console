import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';

//
// export interface UserModel {
//     created_at: TimeStamp;
//     domain_id?: string;
//     email?: string;
//     email_verified?: boolean;
//     language: string;
//     last_accessed_at: TimeStamp | number;
//     name: string;
//     state: string;
//     tags?: Tags;
//     timezone: string;
//     user_id: string;
//     backend: string;
//     user_type: UserType;
//     role_bindings?: RoleBindingModel[];
// }
type UserState = 'ENABLED' | 'DISABLED' | 'PENDING';
export type UserType = 'USER' | 'API_USER';
export type AuthType = 'EXTERNAL' | 'LOCAL';

export interface UserModel {
    user_id: string;
    name: string;
    email: string;
    email_verified: boolean;
    state: UserState;
    user_type: UserType;
    auth_type: AuthType; // backend
    role_type: RoleType;
    mfa: any;
    required_actions: string[];
    language: string;
    timezone: string;
    tags: Tags;
    domain_id: string;
    last_accessed_at: TimeStamp;
    created_at: TimeStamp;
}
