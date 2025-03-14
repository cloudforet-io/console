import type { MEMBERS_TYPE } from '@/api-clients/identity/user-group/schema/constants';
import type {
    UserGroupModel,
} from '@/api-clients/identity/user-group/schema/model';

export type UserGroupListItemType = Partial<UserGroupModel>;

export type MembersType = typeof MEMBERS_TYPE[keyof typeof MEMBERS_TYPE];
