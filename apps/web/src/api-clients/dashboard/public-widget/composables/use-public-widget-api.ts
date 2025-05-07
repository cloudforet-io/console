import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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

export const usePublicWidgetApi = () => {
    const action = {
        create: SpaceConnector.clientV2.dashboard.publicWidget.create<PublicWidgetCreateParameters, PublicWidgetModel>,
        update: SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>,
        delete: SpaceConnector.clientV2.dashboard.publicWidget.delete<PublicWidgetDeleteParameters>,
        load: SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, WidgetLoadResponse>,
        loadSum: SpaceConnector.clientV2.dashboard.publicWidget.loadSum<PublicWidgetLoadSumParameters, WidgetLoadResponse>,
        get: SpaceConnector.clientV2.dashboard.publicWidget.get<PublicWidgetGetParameters, PublicWidgetModel>,
        list: SpaceConnector.clientV2.dashboard.publicWidget.list<PublicWidgetListParameters, ListResponse<PublicWidgetModel>>,
    };

    return {
        publicWidgetAPI: action,
    };
};
