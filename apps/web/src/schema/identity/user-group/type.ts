import type {
    NotificationChannelPerUserGroupModel,
    UserGroupModel,
    UserPerUserGroupModel,
} from '@/schema/identity/user-group/model';

export type UserGroupListItemType = Partial<UserGroupModel>;

export type UserListPerUserGroupItemType = Partial<UserPerUserGroupModel>;

export type NotificationChannelListPerUserGroupItemType = Partial<NotificationChannelPerUserGroupModel>;
