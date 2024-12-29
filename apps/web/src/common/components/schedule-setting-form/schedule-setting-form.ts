import type { TranslateResult } from 'vue-i18n';

export type ScheduleType = 'ALL_DAY' | 'WEEK_DAY' | 'WEEKEND' | 'CUSTOM';
export type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ScheduleRadioType = {
    name: ScheduleType;
    label: TranslateResult;
};
export type ScheduleDayButtonType = {
    name: DayType;
    label: TranslateResult;
};

type ScheduleFormType = {
    SCHEDULE_TYPE: ScheduleType;
};
export type ScheduleFormDayType = {
    is_scheduled: boolean;
    start: number;
    end: number;
};

export type ScheduleSettingFormType = ScheduleFormType & Partial<Record<DayType, ScheduleFormDayType>> & {
    TIMEZONE: string;
};
