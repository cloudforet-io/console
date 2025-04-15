import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PublicDashboardChangeFolderParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/change-folder';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import type { PublicDashboardDeleteParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/delete';
import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import type { PublicDashboardShareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/unshare';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';


export const usePublicDashboardApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.dashboard.publicDashboard.create<PublicDashboardCreateParameters, PublicDashboardModel>,
        update: SpaceConnector.clientV2.dashboard.publicDashboard.update<PublicDashboardUpdateParameters, PublicDashboardModel>,
        changeFolder: SpaceConnector.clientV2.dashboard.publicDashboard.changeFolder<PublicDashboardChangeFolderParameters, PublicDashboardModel>,
        share: SpaceConnector.clientV2.dashboard.publicDashboard.share<PublicDashboardShareParameters, PublicDashboardModel>,
        unshare: SpaceConnector.clientV2.dashboard.publicDashboard.unshare<PublicDashboardUnshareParameters, PublicDashboardModel>,
        delete: SpaceConnector.clientV2.dashboard.publicDashboard.delete<PublicDashboardDeleteParameters>,
        get: SpaceConnector.clientV2.dashboard.publicDashboard.get<PublicDashboardGetParameters, PublicDashboardModel>,
        list: SpaceConnector.clientV2.dashboard.publicDashboard.list<PublicDashboardListParameters, ListResponse<PublicDashboardModel>>,
    };

    return {
        publicDashboardAPI: actions,
    };
};
