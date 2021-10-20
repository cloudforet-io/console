import dayjs from 'dayjs';
import {
    computed,
} from '@vue/composition-api';
import { i18n } from '@/translations';
import { dayjsLocaleMap } from '@/translations/vendors/dayjs';

export const useI18nDayjs = () => ({
    i18nDayjs: computed<typeof dayjs>(() => {
        dayjs.locale(dayjsLocaleMap[i18n.locale]);
        return dayjs;
    }),
});
