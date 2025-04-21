import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import { concat } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { useServiceRouter } from '@/router/composables/use-service-router';

import { MENU_ID } from '@/lib/menu/config';
import type { Reference, ResourceType } from '@/lib/reference/type';

import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

interface LinkFormatter {
    (baseUrl: string, data: string, reference: Reference, query: Location['query']): Location;
}

export const useReferenceRouter = () => {
    const router = useRouter();
    const serviceRouter = useServiceRouter(router);
    const queryHelper = new QueryHelper();

    const serverLinkFormatter: LinkFormatter = (name, data, reference, query) => {
        const location = { name, query };
        let filters: any[] = [];
        if (data) {
            queryHelper.setFilters([{ k: 'server_id', v: data, o: '=' }]);
            filters.push(...queryHelper.rawQueryStrings);
            if (query?.filters) {
                filters = concat(queryHelper.rawQueryStrings, query?.filters);
            }
        }
        location.query = { filters };
        return location;
    };

    const projectLinkFormatter: LinkFormatter = (name, data, reference, query) => {
        const location = serviceRouter.getLocation({
            feature: MENU_ID.PROJECT,
            routeKey: 'detail',
            params: { id: data },
        });
        if (data) {
            return {
                ...location,
                query,
            };
        } return {};
    };

    const projectGroupLinkFormatter: LinkFormatter = (name, data) => serviceRouter.getLocation({
        feature: MENU_ID.PROJECT,
        routeKey: 'projectGroup',
        params: { id: data },
    });

    const collectorLinkFormatter: LinkFormatter = (name, data, reference, query) => {
        const location = { name, query };
        let filters: any[] = [];
        if (data) {
            queryHelper.setFilters([{ k: 'collector_id', v: data, o: '=' }]);
            filters.push(...queryHelper.rawQueryStrings);
            if (query?.filters) {
                filters = concat(queryHelper.rawQueryStrings, query?.filters);
            }
        }
        location.query = { filters };
        return location;
    };

    const serviceAccountLinkFormatter: LinkFormatter = (name, data, reference, query) => ({
        name,
        query,
        params: { serviceAccountId: data },
    });

    const cloudServiceLinkFormatter: LinkFormatter = (name, data, reference, query) => ({
        name,
        query,
        params: {
            searchKey: reference.reference_key || 'reference.resource_id',
            id: data,
        },
    });

    const cloudServiceTypeLinkFormatter: LinkFormatter = (name, data, reference, query) => ({
        name,
        query,
        params: { id: data },
    });

    type RouterMap = Record<ResourceType, { name: string; formatter: LinkFormatter}>;

    const getRouterMap = (isAdminMode?: boolean): RouterMap => ({
        'inventory.Server': {
            name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
            formatter: serverLinkFormatter,
        },
        'identity.Project': {
            name: serviceRouter.getLocation({
                feature: MENU_ID.PROJECT,
                routeKey: 'detail',
            }).name || PROJECT_ROUTE_V2._NAME,
            formatter: projectLinkFormatter,
        },
        'identity.ProjectGroup': {
            name: serviceRouter.getLocation({
                feature: MENU_ID.PROJECT,
                routeKey: 'projectGroup',
            }).name || PROJECT_ROUTE_V2._NAME,
            formatter: projectGroupLinkFormatter,
        },
        'inventory.Collector': {
            name: isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
            formatter: collectorLinkFormatter,
        },
        'identity.ServiceAccount': {
            name: isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE.DETAIL._NAME : SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
            formatter: serviceAccountLinkFormatter,
        },
        'identity.TrustedAccount': {
            name: isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE.DETAIL._NAME : SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
            formatter: serviceAccountLinkFormatter,
        },
        'inventory.CloudService': {
            name: isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
            formatter: cloudServiceLinkFormatter,
        },
        'inventory.CloudServiceType': {
            name: isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
            formatter: cloudServiceTypeLinkFormatter,
        },
    });

    const getReferenceLocation = (data: string, reference: Reference, query?: Location['query']): Location => {
        const routerMap = getRouterMap(reference.isAdminMode);
        if (routerMap[reference.resource_type]) {
            const { name, formatter } = routerMap[reference.resource_type];
            const location = formatter(name, data, reference, query);
            if (reference.workspace_id) {
                location.params = {
                    ...location.params,
                    workspaceId: reference.workspace_id,
                };
            }
            return location;
        }
        console.error(`[referenceRouter]: ${reference.resource_type} is not supported`);
        return {};
    };

    return {
        getReferenceLocation,
    };
};
