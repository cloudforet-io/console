import type { PrivateWidgetGetParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/get';
import type { PrivateWidgetListParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load';
import type { PrivateWidgetLoadSumParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load-sum';

export const privateWidgetKeys = {
    all: ['private-widget'] as const,
    list: (params: PrivateWidgetListParameters) => [...privateWidgetKeys.all, 'list', params] as const,
    get: (idParam: PrivateWidgetGetParameters['widget_id']) => [...privateWidgetKeys.all, 'get', idParam] as const,
    load: (idParam: PrivateWidgetLoadParameters['widget_id']) => [...privateWidgetKeys.all, 'load', idParam] as const,
    loadSum: (idParam: PrivateWidgetLoadSumParameters['widget_id']) => [...privateWidgetKeys.all, 'load-sum', idParam] as const,
};
