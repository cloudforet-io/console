import type {
    USER_GROUP_CHANNEL_SCHEDULE_TYPE,
    USER_GROUP_CHANNEL_STATE,
} from '@/schema/alert-manager/user-group-channel/constants';

export type UserChannelStateType = typeof USER_GROUP_CHANNEL_STATE[keyof typeof USER_GROUP_CHANNEL_STATE];
export type UserChannelScheduleType = typeof USER_GROUP_CHANNEL_SCHEDULE_TYPE[keyof typeof USER_GROUP_CHANNEL_SCHEDULE_TYPE];

export type UserChannelScheduleDayType = {
    is_schedule: boolean;
    start: number;
    end: number;
};
export type UserChannelScheduleInfoType = {
    SCHEDULE_TYPE: UserChannelScheduleType;
    MON: UserChannelScheduleDayType;
    TUE: UserChannelScheduleDayType;
    WED: UserChannelScheduleDayType;
    THU: UserChannelScheduleDayType;
    FRI: UserChannelScheduleDayType;
    SAT: UserChannelScheduleDayType;
    SUN: UserChannelScheduleDayType;
};
