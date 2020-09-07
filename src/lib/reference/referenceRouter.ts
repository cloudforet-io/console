
interface ReferenceLinkFormatter {
    (baseUrl: string, referenceKey: string): string;
}

export const projectLinkFormatter: ReferenceLinkFormatter = (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}/${referenceKey}`;
    return queryString;
};

export const serverLinkFormatter: ReferenceLinkFormatter = (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}?filters=server_id%3A${referenceKey}`;
    return queryString;
};

export const collectorLinkFormatter: ReferenceLinkFormatter = (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}?filters=collector_id%3A${referenceKey}`;
    return queryString;
};

export const serviceAccountLinkFormatter: ReferenceLinkFormatter = (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}/search/${referenceKey}`;
    return queryString;
};


type ReferenceType =
    | 'inventory.Server'
    | 'identity.Project'
    | 'inventory.Collector'
    | 'identity.ServiceAccount'

type RouterMap = Record<ReferenceType, { baseUrl: string; formatter: ReferenceLinkFormatter}>

export const RouterMap: RouterMap = {
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
};

export const referenceRouter = (referenceType: ReferenceType|string, referenceKey): string => {
    const { baseUrl, formatter } = RouterMap[referenceType];
    const link = formatter(baseUrl, referenceKey);
    return link;
};

export default referenceRouter;
