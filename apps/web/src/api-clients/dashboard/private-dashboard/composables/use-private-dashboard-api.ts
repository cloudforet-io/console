import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateDashboardChangeFolderParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/change-folder';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/delete';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';


export const usePrivateDashboardApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.dashboard.privateDashboard.create<PrivateDashboardCreateParameters, PrivateDashboardModel>,
        update: SpaceConnector.clientV2.dashboard.privateDashboard.update<PrivateDashboardUpdateParameters, PrivateDashboardModel>,
        changeFolder: SpaceConnector.clientV2.dashboard.privateDashboard.changeFolder<PrivateDashboardChangeFolderParameters, PrivateDashboardModel>,
        delete: SpaceConnector.clientV2.dashboard.privateDashboard.delete<PrivateDashboardDeleteParameters>,
        get: SpaceConnector.clientV2.dashboard.privateDashboard.get<PrivateDashboardGetParameters, PrivateDashboardModel>,
        list: SpaceConnector.clientV2.dashboard.privateDashboard.list<PrivateDashboardListParameters, ListResponse<PrivateDashboardModel>>,
    };

    return {
        privateDashboardAPI: actions,
    };
};
