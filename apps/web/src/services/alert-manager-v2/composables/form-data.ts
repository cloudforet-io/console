import { zipObject } from 'lodash';

import type { ServiceChannelScheduleDayType } from '@/schema/alert-manager/service-channel/type';

import type { ScheduleDayType, ScheduleForm } from '@/common/components/schedule-setting-form/schedule-setting-form';

export const createScheduleMap = (scheduleForm: ScheduleForm): Record<ScheduleDayType, ServiceChannelScheduleDayType> => {
    const allDays: ScheduleDayType[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const { days, start, end } = scheduleForm;

    const refinedDays = allDays.map((day) => ({
        is_scheduled: days.includes(day),
        start,
        end,
    }));

    return zipObject(allDays, refinedDays) as Record<ScheduleDayType, ServiceChannelScheduleDayType>;
};
