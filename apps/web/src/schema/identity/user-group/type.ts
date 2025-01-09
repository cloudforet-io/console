import type { MEMBERS_TYPE } from '@/schema/identity/user-group/constants';
import type {
    UserGroupModel,
} from '@/schema/identity/user-group/model';

export type UserGroupListItemType = Partial<UserGroupModel>;

export type MembersType = typeof MEMBERS_TYPE[keyof typeof MEMBERS_TYPE];
