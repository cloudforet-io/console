import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DashboardTemplateListParameters } from '@/api-clients/repository/dashboard-template/schema/api-verbs/list';
import type { DashboardTemplateRegisterParameters } from '@/api-clients/repository/dashboard-template/schema/api-verbs/register';
import type { DashboardTemplateModel } from '@/api-clients/repository/dashboard-template/schema/model';


export const useDashboardTemplateApi = () => {
    const actions = {
        register: SpaceConnector.clientV2.repository.dashboardTemplate.register<DashboardTemplateRegisterParameters, DashboardTemplateModel>,
        list: SpaceConnector.clientV2.repository.dashboardTemplate.list<DashboardTemplateListParameters, ListResponse<DashboardTemplateModel>>,
    };

    return {
        dashboardTemplateAPI: actions,
    };
};
