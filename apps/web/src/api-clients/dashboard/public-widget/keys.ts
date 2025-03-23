import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load';
import type { PublicWidgetLoadSumParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load-sum';

export const publicWidgetKeys = {
    list: (params: PublicWidgetListParameters) => ['public-widget', 'list', params] as const,
    get: (idParam: PublicWidgetGetParameters['widget_id']) => ['public-widget', 'get', idParam] as const,
    load: (idParam: PublicWidgetLoadParameters['widget_id']) => ['public-widget', 'load', idParam] as const,
    loadSum: (idParam: PublicWidgetLoadSumParameters['widget_id']) => ['public-widget', 'load-sum', idParam] as const,
};
