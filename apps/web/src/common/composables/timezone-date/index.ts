import type { Ref } from 'vue';
import { computed } from 'vue';

import dayjs from 'dayjs';

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
    return {
        getTimezoneDate,
        timezoneDate,
    };
};
