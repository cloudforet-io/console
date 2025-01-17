import type { USER_CHANNEL_SCHEDULE_TYPE, USER_CHANNEL_STATE } from '@/schema/alert-manager/user-channel/constants';

export type UserChannelStateType = typeof USER_CHANNEL_STATE[keyof typeof USER_CHANNEL_STATE];
export type UserChannelScheduleType = typeof USER_CHANNEL_SCHEDULE_TYPE[keyof typeof USER_CHANNEL_SCHEDULE_TYPE];

export type UserChannelScheduleDayType = {
    is_scheduled: boolean;
    start: number;
    end: number;
};
export type UserChannelScheduleInfoType = {
    SCHEDULE_TYPE: UserChannelScheduleType;
    TIMEZONE: string;
    MON: UserChannelScheduleDayType;
    TUE: UserChannelScheduleDayType;
    WED: UserChannelScheduleDayType;
    THU: UserChannelScheduleDayType;
    FRI: UserChannelScheduleDayType;
    SAT: UserChannelScheduleDayType;
    SUN: UserChannelScheduleDayType;
};
