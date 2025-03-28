import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import type { PublicWidgetCreateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/create';
import type { PublicWidgetDeleteParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/delete';
import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load';
import type { PublicWidgetLoadSumParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/load-sum';
import type { PublicWidgetUpdateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/update';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

interface UsePublicWidgetApiReturn {
    publicWidgetGetQueryKey: ComputedRef<QueryKey>;
    publicWidgetListQueryKey: ComputedRef<QueryKey>;
    publicWidgetLoadQueryKey: ComputedRef<QueryKey>;
    publicWidgetLoadSumQueryKey: ComputedRef<QueryKey>;
    publicWidgetAPI: {
        create: (params: PublicWidgetCreateParameters) => Promise<PublicWidgetModel>;
        update: (params: PublicWidgetUpdateParameters) => Promise<PublicWidgetModel>;
        delete: (params: PublicWidgetDeleteParameters) => Promise<void>;
        load: (params: PublicWidgetLoadParameters) => Promise<WidgetLoadResponse>;
        loadSum: (params: PublicWidgetLoadSumParameters) => Promise<WidgetLoadResponse>;
        get: (params: PublicWidgetGetParameters) => Promise<PublicWidgetModel>;
        list: (params: PublicWidgetListParameters) => Promise<ListResponse<PublicWidgetModel>>;
    }
}

export const usePublicWidgetApi = (): UsePublicWidgetApiReturn => {
    const publicWidgetGetQueryKey = useAPIQueryKey('dashboard', 'public-widget', 'get');
    const publicWidgetListQueryKey = useAPIQueryKey('dashboard', 'public-widget', 'list');
    const publicWidgetLoadQueryKey = useAPIQueryKey('dashboard', 'public-widget', 'load');
    const publicWidgetLoadSumQueryKey = useAPIQueryKey('dashboard', 'public-widget', 'load-sum');

    const action = {
        async create(params: PublicWidgetCreateParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.create<PublicWidgetCreateParameters, PublicWidgetModel>(params);
        },
        async update(params: PublicWidgetUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>(params);
        },
        async delete(params: PublicWidgetDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.delete<PublicWidgetDeleteParameters>(params);
        },
        async load(params: PublicWidgetLoadParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, WidgetLoadResponse>(params);
        },
        async loadSum(params: PublicWidgetLoadSumParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.loadSum<PublicWidgetLoadSumParameters, WidgetLoadResponse>(params);
        },
        async get(params: PublicWidgetGetParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.get<PublicWidgetGetParameters, PublicWidgetModel>(params);
        },
        async list(params: PublicWidgetListParameters) {
            return SpaceConnector.clientV2.dashboard.publicWidget.list<PublicWidgetListParameters, ListResponse<PublicWidgetModel>>(params);
        },
    };

    return {
        publicWidgetGetQueryKey,
        publicWidgetListQueryKey,
        publicWidgetLoadQueryKey,
        publicWidgetLoadSumQueryKey,
        publicWidgetAPI: action,
    };
};
