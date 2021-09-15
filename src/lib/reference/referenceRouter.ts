/* eslint-disable camelcase */
import { concat } from 'lodash';
import { Location } from 'vue-router';
import { Reference, ReferenceType } from '@/lib/reference/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { PLUGIN_ROUTE } from '@/services/plugin/routes';
import { PROJECT_ROUTE } from '@/services/project/routes';
import { AUTOMATION_ROUTE } from '@/services/automation/routes';
import { IDENTITY_ROUTE } from '@/services/identity/routes';

interface LinkFormatter {
    (baseUrl: string, data: string, reference: Reference, query: Location['query']): Location;
}

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
    const location = {
        name,
        query,
        params: { id: data },
    };
    return location;
};

const projectGroupLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query: {
            ...query,
            select_pg: data,
        },
    };
    return location;
};

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

const serviceAccountLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: { id: data },
    };
    return location;
};

const cloudServiceLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: {
            searchKey: reference.reference_key || 'reference.resource_id',
            id: data,
        },
    };
    return location;
};

const cloudServiceTypeLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: { id: data },
    };
    return location;
};

const spotGroupLinkFormatter: LinkFormatter = (name, data, reference, query) => {
    const location = {
        name,
        query,
        params: { id: data },
    };
    return location;
};

type RouterMap = Record<ReferenceType, { name: string; formatter: LinkFormatter}>

const routerMap: RouterMap = {
    'inventory.Server':
        {
            name: INVENTORY_ROUTE.SERVER._NAME,
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
            name: PLUGIN_ROUTE.COLLECTOR._NAME,
            formatter: collectorLinkFormatter,
        },
    'identity.ServiceAccount':
        {
            name: IDENTITY_ROUTE.SERVICE_ACCOUNT.SEARCH._NAME,
            formatter: serviceAccountLinkFormatter,
        },
    'inventory.CloudService':
        {
            name: INVENTORY_ROUTE.CLOUD_SERVICE.SEARCH._NAME,
            formatter: cloudServiceLinkFormatter,
        },
    'inventory.CloudServiceType':
        {
            name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE_SEARCH._NAME,
            formatter: cloudServiceTypeLinkFormatter,
        },
    'spot_automation.SpotGroup':
        {
            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.DETAIL._NAME,
            formatter: spotGroupLinkFormatter,
        },
};

export const referenceRouter = (data: string, reference: Reference, query?: Location['query']): Location => {
    if (routerMap[reference.resource_type]) {
        const { name, formatter } = routerMap[reference.resource_type];
        return formatter(name, data, reference, query);
    }
    console.error(`[referenceRouter]: ${reference.resource_type} is not supported`);
    return {};
};

export default referenceRouter;
