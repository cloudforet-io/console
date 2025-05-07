import type { RawLocation } from 'vue-router';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

const queryHelper = new QueryHelper();

export const topBarSearchReferenceRouter = (type: Exclude<SearchTab, 'service'>, resourceId: string, workspaceId: string, options?: any):RawLocation => {
    switch (type) {
    case SEARCH_TAB.SERVICE_ACCOUNT:
        return {
            name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
            params: { serviceAccountId: resourceId, workspaceId },
        };
    case SEARCH_TAB.DASHBOARD:
        return {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: resourceId, workspaceId },
        };
    case SEARCH_TAB.CLOUD_SERVICE:
        if (!options.name || !options.group || !options.provider) throw new Error('provider and group are required for cloudService type');
        return {
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                name: options.name,
                workspaceId,
                group: options.group,
                provider: options.provider,
            },
            query: {
                filters: queryHelper.setFilters([{ k: 'reference.resource_id', v: [options?.resource_id], o: '=' }]).rawQueryStrings,
            },
        };
    default:
        return {};
    }
};
