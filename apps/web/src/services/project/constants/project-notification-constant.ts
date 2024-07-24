import { computed } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

export const RadioMenuList = computed<MenuItem[]>(() => [
    {
        label: i18n.t('PROJECT.DETAIL.NOTIFICATION_ALL_USERS'),
        name: 'all',
    },
    {
        label: i18n.t('PROJECT.DETAIL.NOTIFICATION_SPECIFIC_MEMBER'),
        name: 'specific',
    },
]);
