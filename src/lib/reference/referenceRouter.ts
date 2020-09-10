import { Reference, ReferenceType } from '@/lib/reference/type';

interface ReferenceLinkFormatter {
    (baseUrl: string, data: string, reference: Reference): string;
}

export const projectLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/${data}`;
    return queryString;
};

export const serverLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}?filters=server_id%3A${data}`;
    return queryString;
};

export const collectorLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}?filters=collector_id%3A${data}`;
    return queryString;
};

export const serviceAccountLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/search/${data}`;
    return queryString;
};

export const cloudServiceLinkFormatter: ReferenceLinkFormatter = (baseUrl, data, reference) => {
    const queryString = `${baseUrl}/search/${reference.reference_key || 'reference.resource_id'}/${data}`;
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
    'inventory.Collector':
        {
            baseUrl: '/plugin/collector',
            formatter: collectorLinkFormatter,
        },
    'identity.ServiceAccount':
        {
            baseUrl: '/identity/service-account',
            formatter: serviceAccountLinkFormatter,
        },
    'inventory.CloudService':
        {
            baseUrl: '/inventory/cloud-service',
            formatter: cloudServiceLinkFormatter,
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
