import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load';
import type { PublicWidgetLoadSumParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load-sum';

export const publicWidgetKeys = {
    all: ['public-widget'],
    list: (params: PublicWidgetListParameters) => [...publicWidgetKeys.all, 'list', params],
    get: (idParam: PublicWidgetGetParameters['widget_id']) => [...publicWidgetKeys.all, 'get', idParam],
    load: (idParam: PublicWidgetLoadParameters['widget_id']) => [...publicWidgetKeys.all, 'load', idParam],
    loadSum: (idParam: PublicWidgetLoadSumParameters['widget_id']) => [...publicWidgetKeys.all, 'load-sum', idParam],
};
