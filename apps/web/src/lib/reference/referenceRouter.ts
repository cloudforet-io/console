/* eslint-disable camelcase */
import { QueryHelper } from '@cloudforet/core-lib/query';
import { concat } from 'lodash';
import type { RouteLocation } from 'vue-router';



import type { Reference, ResourceType } from '@/lib/reference/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

interface LinkFormatter {
    (baseUrl: string, data: string, reference: Reference, query: RouteLocation['query']): RouteLocation;
}

const queryHelper = new QueryHelper();

const serverLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = { name, query } as RouteLocation;
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
    if (data) {
        return {
            name,
            query,
            params: (data ? { id: data } : undefined) as RouteLocation['params'],
        } as RouteLocation;
    } return {} as RouteLocation;
};

const projectGroupLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query: {
            ...query,
            select_pg: data,
        } as RouteLocation['query'],
    } as RouteLocation;
    return location;
};

const collectorLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = { name, query } as RouteLocation;
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

const serviceAccountLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: { serviceAccountId: data } as RouteLocation['params'],
    } as RouteLocation;
    return location;
};

const cloudServiceLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: {
            searchKey: reference.reference_key || 'reference.resource_id',
            id: data,
        } as RouteLocation['params'],
    } as RouteLocation;
    return location;
};

const cloudServiceTypeLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: { id: data } as RouteLocation['params'],
    } as RouteLocation;
    return location;
};

type RouterMap = Record<ResourceType, { name: string; formatter: LinkFormatter}>;

const routerMap: RouterMap = {
    'inventory.Server':
        {
            name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
            formatter: serverLinkFormatter,
        },
    'identity.Project':
        {
            name: PROJECT_ROUTE.DETAIL._NAME,
            formatter: projectLinkFormatter,
        },
    'identity.ProjectGroup':
        {
            name: PROJECT_ROUTE._NAME,
            formatter: projectGroupLinkFormatter,
        },
    'inventory.Collector':
        {
            name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
            formatter: collectorLinkFormatter,
        },
    'identity.ServiceAccount':
        {
            name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
            formatter: serviceAccountLinkFormatter,
        },
    'inventory.CloudService':
        {
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
            formatter: cloudServiceLinkFormatter,
        },
    'inventory.CloudServiceType':
        {
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
            formatter: cloudServiceTypeLinkFormatter,
        },
};

export const referenceRouter = (data: string, reference: Reference, query?: RouteLocation['query']): RouteLocation => {
    if (routerMap[reference.resource_type]) {
        const { name, formatter } = routerMap[reference.resource_type];
        return formatter(name, data, reference, query as RouteLocation['query']);
    }
    console.error(`[referenceRouter]: ${reference.resource_type} is not supported`);
    return {} as RouteLocation;
};

export default referenceRouter;
