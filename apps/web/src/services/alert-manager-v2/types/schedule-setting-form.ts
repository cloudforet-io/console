import type { TranslateResult } from 'vue-i18n';

export type ScheduleType = 'ALL_DAY' | 'WEEK_DAY' | 'CUSTOM';
export type ScheduleDayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ScheduleRadioType = {
    name: ScheduleType;
    label: TranslateResult;
};
export type ScheduleDayButtonType = {
    name: ScheduleDayType;
    label: TranslateResult;
};

export type ScheduleForm = {
    type: ScheduleType;
    days: ScheduleDayType[];
    start: number;
    end: number;
};
