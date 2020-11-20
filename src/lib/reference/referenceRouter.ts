import { Reference, ReferenceType } from '@/lib/reference/type';

interface ReferenceLinkFormatter {
    (baseUrl: string, data: string, reference: Reference): string;
}

export const projectLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/${data}`;
    return queryString;
};

export const projectGroupLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}?select_pg=${data}`;
    return queryString;
};

export const serverLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = data ? `${baseUrl}?filters=server_id%3A${data}` : `${baseUrl}`;
    return queryString;
};

export const collectorLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}?filters=collector_id%3A${data}`;
    return queryString;
};

const serviceAccountLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/${data}`;
    return queryString;
};

const cloudServiceLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/${reference.reference_key || 'reference.resource_id'}/${data}`;
    return queryString;
};

const cloudServiceTypeLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/${data}`;
    return queryString;
};


type RouterMap = Record<ReferenceType, { baseUrl: string; formatter: ReferenceLinkFormatter}>

const routerMap: RouterMap = {
    'inventory.Server':
        {
            baseUrl: '/inventory/server',
            formatter: serverLinkFormatter,
        },
    'identity.Project':
        {
            baseUrl: '/project',
            formatter: projectLinkFormatter,
        },
    'identity.ProjectGroup':
        {
            baseUrl: '/project',
            formatter: projectGroupLinkFormatter,
        },
    'inventory.Collector':
        {
            baseUrl: '/plugin/collector',
            formatter: collectorLinkFormatter,
        },
    'identity.ServiceAccount':
        {
            baseUrl: '/identity/service-account/search',
            formatter: serviceAccountLinkFormatter,
        },
    'inventory.CloudService':
        {
            baseUrl: '/inventory/cloud-service/search',
            formatter: cloudServiceLinkFormatter,
        },
    'inventory.CloudServiceType':
        {
            baseUrl: '/inventory/cloud-service/type/search',
            formatter: cloudServiceTypeLinkFormatter,
        },
};

export const referenceRouter = (data: string, reference: Reference): string => {
    if (routerMap[reference.resource_type]) {
        const { baseUrl, formatter } = routerMap[reference.resource_type];
        const link = formatter(baseUrl, data, reference);
        return link;
    }
    console.error(`[referenceRouter]: ${reference.resource_type} is not supported`);


    return '';
};

export default referenceRouter;
