import type {
    SERVICE_CHANNEL_FORWARD_TYPE,
    SERVICE_CHANNEL_STATE,
    SERVICE_CHANNEL_TYPE,
    SERVICE_CHANNEL_SCHEDULE_TYPE,
} from '@/api-clients/alert-manager/service-channel/schema/constants';

export type ServiceChannelStateType = typeof SERVICE_CHANNEL_STATE[keyof typeof SERVICE_CHANNEL_STATE];
export type ServiceChannelType = typeof SERVICE_CHANNEL_TYPE[keyof typeof SERVICE_CHANNEL_TYPE];
export type ServiceChannelForwardType = typeof SERVICE_CHANNEL_FORWARD_TYPE[keyof typeof SERVICE_CHANNEL_FORWARD_TYPE];
export type ServiceChannelScheduleType = typeof SERVICE_CHANNEL_SCHEDULE_TYPE[keyof typeof SERVICE_CHANNEL_SCHEDULE_TYPE];

export type ServiceChannelDataType = {
    FORWARD_TYPE: ServiceChannelForwardType;
    USER?: string[];
    USER_GROUP?: string[];
    PROTOCOL?: string[];
};

export type ServiceChannelScheduleDayType = {
    is_scheduled: boolean;
    start: number;
    end: number;
};
export type ServiceChannelScheduleInfoType = {
    SCHEDULE_TYPE: ServiceChannelScheduleType;
    TIMEZONE: string;
    MON: ServiceChannelScheduleDayType;
    TUE: ServiceChannelScheduleDayType;
    WED: ServiceChannelScheduleDayType;
    THU: ServiceChannelScheduleDayType;
    FRI: ServiceChannelScheduleDayType;
    SAT: ServiceChannelScheduleDayType;
    SUN: ServiceChannelScheduleDayType;
};
