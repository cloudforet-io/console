import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load';
import type { PublicWidgetLoadSumParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load-sum';

export const publicWidgetKeys = {
    all: ['public-widget'] as const,
    list: (params: PublicWidgetListParameters) => [...publicWidgetKeys.all, 'list', params] as const,
    get: (idParam: PublicWidgetGetParameters['widget_id']) => [...publicWidgetKeys.all, 'get', idParam] as const,
    load: (idParam: PublicWidgetLoadParameters['widget_id']) => [...publicWidgetKeys.all, 'load', idParam] as const,
    loadSum: (idParam: PublicWidgetLoadSumParameters['widget_id']) => [...publicWidgetKeys.all, 'load-sum', idParam] as const,
};
