import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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

export const usePrivateWidgetApi = () => {
    const action = {
        create: SpaceConnector.clientV2.dashboard.privateWidget.create<PrivateWidgetCreateParameters, PrivateWidgetModel>,
        update: SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>,
        delete: SpaceConnector.clientV2.dashboard.privateWidget.delete<PrivateWidgetDeleteParameters>,
        load: SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, WidgetLoadResponse>,
        loadSum: SpaceConnector.clientV2.dashboard.privateWidget.loadSum<PrivateWidgetLoadSumParameters, WidgetLoadResponse>,
        get: SpaceConnector.clientV2.dashboard.privateWidget.get<PrivateWidgetGetParameters, PrivateWidgetModel>,
        list: SpaceConnector.clientV2.dashboard.privateWidget.list<PrivateWidgetListParameters, ListResponse<PrivateWidgetModel>>,
    };

    return {
        privateWidgetAPI: action,
    };
};
