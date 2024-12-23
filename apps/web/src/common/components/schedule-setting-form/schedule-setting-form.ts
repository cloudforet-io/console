import type { TranslateResult } from 'vue-i18n';

import type { ServiceChannelScheduleType } from '@/schema/alert-manager/service-channel/type';

export type ScheduleDayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ScheduleRadioType = {
    name: ServiceChannelScheduleType;
    label: TranslateResult;
};
export type ScheduleDayButtonType = {
    name: ScheduleDayType;
    label: TranslateResult;
};

export type ScheduleForm = {
    type: ServiceChannelScheduleType;
    days: ScheduleDayType[];
    start: number;
    end: number;
};
