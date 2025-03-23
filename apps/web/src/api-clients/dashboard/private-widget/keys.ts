import type { PrivateWidgetGetParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/get';
import type { PrivateWidgetListParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load';
import type { PrivateWidgetLoadSumParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load-sum';

export const privateWidgetKeys = {
    list: (params: PrivateWidgetListParameters) => ['private-widget', 'list', params] as const,
    get: (idParam: PrivateWidgetGetParameters['widget_id']) => ['private-widget', 'get', idParam] as const,
    load: (idParam: PrivateWidgetLoadParameters['widget_id']) => ['private-widget', 'load', idParam] as const,
    loadSum: (idParam: PrivateWidgetLoadSumParameters['widget_id']) => ['private-widget', 'load-sum', idParam] as const,
};
