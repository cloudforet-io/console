import type {
    USER_GROUP_CHANNEL_SCHEDULE_TYPE,
    USER_GROUP_CHANNEL_STATE,
} from '@/schema/alert-manager/user-group-channel/constants';

export type UserGroupChannelStateType = typeof USER_GROUP_CHANNEL_STATE[keyof typeof USER_GROUP_CHANNEL_STATE];
export type UserGroupChannelScheduleType = typeof USER_GROUP_CHANNEL_SCHEDULE_TYPE[keyof typeof USER_GROUP_CHANNEL_SCHEDULE_TYPE];

export type UserGroupChannelScheduleDayType = {
    is_scheduled: boolean;
    start?: number;
    end?: number;
};
export type UserGroupChannelScheduleInfoType = {
    SCHEDULE_TYPE: UserGroupChannelScheduleType;
    TIMEZONE: string;
    MON?: UserGroupChannelScheduleDayType;
    TUE?: UserGroupChannelScheduleDayType;
    WED?: UserGroupChannelScheduleDayType;
    THU?: UserGroupChannelScheduleDayType;
    FRI?: UserGroupChannelScheduleDayType;
    SAT?: UserGroupChannelScheduleDayType;
    SUN?: UserGroupChannelScheduleDayType;
};
