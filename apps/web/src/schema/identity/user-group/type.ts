import type {
    NotificationChannelPerUserGroupModel,
    UserGroupModel,
} from '@/schema/identity/user-group/model';

export type UserGroupListItemType = Partial<UserGroupModel>;

export type NotificationChannelListPerUserGroupItemType = Partial<NotificationChannelPerUserGroupModel>;
