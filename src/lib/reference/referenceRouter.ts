
export const projectLinkFormatter = async (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}/${referenceKey}`;
    return queryString;
};

export const serverLinkFormatter = async (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}?f=server_id%3A${referenceKey}`;
    return queryString;
};

export const collectorLinkFormatter = async (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}?f=collector_id%3A${referenceKey}`;
    return queryString;
};

export const serviceAccountLinkFormatter = async (baseUrl, referenceKey) => {
    const queryString = `${baseUrl}/search`;
    return queryString;
};


export const RouterMap = {
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

export const referenceRouter = async (referenceType, referenceKey): Promise<string> => {
    const { baseUrl, formatter } = RouterMap[referenceType];
    const link = await formatter(baseUrl, referenceKey);
    return link;
};

export default referenceRouter;
