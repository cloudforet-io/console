import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateWidgetCreateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/create';
import type { PrivateWidgetDeleteParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/delete';
import type { PrivateWidgetGetParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/get';
import type { PrivateWidgetListParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load';
import type { PrivateWidgetLoadSumParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/load-sum';
import type { PrivateWidgetUpdateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/update';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';

interface UsePrivateWidgetApiReturn {
    privateWidgetGetQueryKey: ComputedRef<QueryKey>;
    privateWidgetListQueryKey: ComputedRef<QueryKey>;
    privateWidgetLoadQueryKey: ComputedRef<QueryKey>;
    privateWidgetLoadSumQueryKey: ComputedRef<QueryKey>;
    privateWidgetAPI: {
        create: (params: PrivateWidgetCreateParameters) => Promise<PrivateWidgetModel>;
        update: (params: PrivateWidgetUpdateParameters) => Promise<PrivateWidgetModel>;
        delete: (params: PrivateWidgetDeleteParameters) => Promise<void>;
        load: (params: PrivateWidgetLoadParameters) => Promise<WidgetLoadResponse>;
        loadSum: (params: PrivateWidgetLoadSumParameters) => Promise<WidgetLoadResponse>;
        get: (params: PrivateWidgetGetParameters) => Promise<PrivateWidgetModel>;
        list: (params: PrivateWidgetListParameters) => Promise<ListResponse<PrivateWidgetModel>>;
    }
}

export const usePrivateWidgetApi = (): UsePrivateWidgetApiReturn => {
    const privateWidgetGetQueryKey = useAPIQueryKey('dashboard', 'private-widget', 'get');
    const privateWidgetListQueryKey = useAPIQueryKey('dashboard', 'private-widget', 'list');
    const privateWidgetLoadQueryKey = useAPIQueryKey('dashboard', 'private-widget', 'load');
    const privateWidgetLoadSumQueryKey = useAPIQueryKey('dashboard', 'private-widget', 'load-sum');

    const action = {
        async create(params: PrivateWidgetCreateParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.create<PrivateWidgetCreateParameters, PrivateWidgetModel>(params);
        },
        async update(params: PrivateWidgetUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>(params);
        },
        async delete(params: PrivateWidgetDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.delete<PrivateWidgetDeleteParameters>(params);
        },
        async load(params: PrivateWidgetLoadParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, WidgetLoadResponse>(params);
        },
        async loadSum(params: PrivateWidgetLoadSumParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.loadSum<PrivateWidgetLoadSumParameters, WidgetLoadResponse>(params);
        },
        async get(params: PrivateWidgetGetParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.get<PrivateWidgetGetParameters, PrivateWidgetModel>(params);
        },
        async list(params: PrivateWidgetListParameters) {
            return SpaceConnector.clientV2.dashboard.privateWidget.list<PrivateWidgetListParameters, ListResponse<PrivateWidgetModel>>(params);
        },
    };

    return {
        privateWidgetGetQueryKey,
        privateWidgetListQueryKey,
        privateWidgetLoadQueryKey,
        privateWidgetLoadSumQueryKey,
        privateWidgetAPI: action,
    };
};
