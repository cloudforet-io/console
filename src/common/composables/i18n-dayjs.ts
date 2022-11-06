import {
    computed,
} from 'vue';

import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { dayjsLocaleMap } from '@/translations/vendors/dayjs';

/**
 * @description Dayjs reflecting changes in language.
 * @example
 * i18nDayjs('2021-12-12').format('MMMM, YYYY')     (O)
 * i18nDayjs(dayjs()).format('MMMM, YYYY')          (X)
 * If you give the dayjs object to the parameter, language changes will not be reflected, so please give parameter with the primitive type.
 */
export const useI18nDayjs = () => ({
    i18nDayjs: computed<typeof dayjs>(() => {
        dayjs.locale(dayjsLocaleMap[i18n.locale]);
        return dayjs;
    }),
});
