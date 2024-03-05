import type { RawLocation } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CloudServiceTypeReferenceItem } from '@/store/modules/reference/cloud-service-type/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionType } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

export const createSearchRecent = async (type: SuggestionType, id: string, workspaceId: string) => {
    try {
        await SpaceConnector.client.addOns.recent.search.create({
            type,
            id,
            workspace_id: workspaceId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const topBarSearchReferenceRouter = (type: Exclude<SearchTab, 'service'>, resourceId: string, workspaceId: string, cloudServiceTypeMap?:CloudServiceTypeReferenceItem):RawLocation => {
    const { name, data } = cloudServiceTypeMap || {};
    switch (type) {
    case 'serviceAccount':
        return {
            name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
            params: { serviceAccountId: resourceId, workspaceId },
        };
    case 'project':
        return {
            name: PROJECT_ROUTE.DETAIL._NAME,
            params: { id: resourceId, workspaceId },
        };
    case 'dashboard':
        return {
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: resourceId, workspaceId },
        };
    case 'cloudService':
        if (!name || !data?.group || !data?.provider) throw new Error('provider and group are required for cloudService type');
        return {
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                name, workspaceId, group: data.group, provider: data.provider,
            },
        };
    default:
        return {};
    }
};
