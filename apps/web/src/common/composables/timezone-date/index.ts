import type { Ref } from 'vue';
import { computed } from 'vue';

import dayjs from 'dayjs';

import { durationFormatter } from '@cloudforet/utils';

import { useUserStore } from '@/store/user/user-store';

interface UseTimezoneDateOptions {
    date?: Ref<string>;
}
export const useTimezoneDate = ({
    date,
}: UseTimezoneDateOptions = {}) => {
    const userStore = useUserStore();
    const getTimezoneDate = (_date: string): string => dayjs.utc(_date).tz(userStore.state.timezone ?? 'UTC').format('YYYY/MM/DD HH:mm:ss');
    const timezoneDate = date ? computed(() => getTimezoneDate(date.value)) : undefined;
    const getDuration = (started: string, finished?: string) => {
        const ended = finished ?? dayjs.utc().toISOString();
        return durationFormatter(started, ended, userStore.state.timezone ?? 'UTC');
    };
    return {
        getTimezoneDate,
        getDuration,
        timezoneDate,
    };
};
