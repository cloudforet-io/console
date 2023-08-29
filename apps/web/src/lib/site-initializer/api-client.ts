import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import TokenAPI from '@cloudforet/core-lib/space-connector/token-api';
import type { MockInfo } from '@cloudforet/core-lib/space-connector/type';


const getAfterCallApiMap = (store) => ({
    '/inventory/cloud-service-type/create': (data) => { store.dispatch('reference/cloudServiceType/sync', data); },
    '/inventory/cloud-service-type/update': (data) => { store.dispatch('reference/cloudServiceType/sync', data); },
    '/inventory/collector/create': (data) => { store.dispatch('reference/collector/sync', data); },
    '/inventory/collector/update': (data) => { store.dispatch('reference/collector/sync', data); },
    '/repository/plugin/create': (data) => { store.dispatch('reference/plugin/sync', data); },
    '/repository/plugin/update': (data) => { store.dispatch('reference/plugin/sync', data); },
    '/identity/project/create': (data) => { store.dispatch('reference/project/sync', data); },
    '/identity/project/update': (data) => { store.dispatch('reference/project/sync', data); },
    '/identity/project-group/create': (data) => { store.dispatch('reference/projectGroup/sync', data); },
    '/identity/project-group/update': (data) => { store.dispatch('reference/projectGroup/sync', data); },
    '/notification/protocol/create': (data) => { store.dispatch('reference/protocol/sync', data); },
    '/notification/protocol/update': (data) => { store.dispatch('reference/protocol/sync', data); },
    '/identity/provider/create': (data) => { store.dispatch('reference/provider/sync', data); },
    '/identity/provider/update': (data) => { store.dispatch('reference/provider/sync', data); },
    '/inventory/region/create': (data) => { store.dispatch('reference/region/sync', data); },
    '/inventory/region/update': (data) => { store.dispatch('reference/region/sync', data); },
    '/secret/secret/create': (data) => { store.dispatch('reference/secret/sync', data); },
    '/secret/secret/update': (data) => { store.dispatch('reference/secret/sync', data); },
    '/identity/service-account/create': (data) => { store.dispatch('reference/serviceAccount/sync', data); },
    '/identity/service-account/update': (data) => { store.dispatch('reference/serviceAccount/sync', data); },
    '/identity/user/create': (data) => { store.dispatch('reference/user/sync', data); },
    '/identity/user/update': (data) => { store.dispatch('reference/user/sync', data); },
    '/monitoring/webhook/create': (data) => { store.dispatch('reference/webhook/sync', data); },
    '/monitoring/webhook/update': (data) => { store.dispatch('reference/webhook/sync', data); },
});

const getSessionTimeoutCallback = (store) => () => {
    // Add session expiration process
    store.dispatch('user/setIsSessionExpired', true);
    store.dispatch('error/showSessionExpiredError');
};
const getApiEndpoints = (config) => {
    const ENDPOINT_V1 = config.get('CONSOLE_API.ENDPOINT');
    const ENDPOINT_V2 = config.get('CONSOLE_API_V2.ENDPOINT');
    if (ENDPOINT_V1 && ENDPOINT_V2) {
        return [ENDPOINT_V1, ENDPOINT_V2];
    }
    if (!ENDPOINT_V1) {
        throw new Error('ApiClient init failed: There are no endpoint v1.');
    } else throw new Error('ApiClient init failed: There are no endpoint v2.');
};
const getMockInfo = (config): MockInfo => ({
    endpoints: [config.get('MOCK.ENDPOINT_V1'), config.get('MOCK.ENDPOINT_V2')],
    all: config.get('MOCK.ALL'),
    reflection: config.get('MOCK.REFLECTION'),
    skipTokenCheck: config.get('MOCK.SKIP_TOKEN_CHECK'),
    apiList: [config.get('MOCK.API_LIST_V1'), config.get('MOCK.API_LIST_V2')],
});

export const initApiClient = async (store, config) => {
    const mockInfo = getMockInfo(config);
    const endpoints = mockInfo.all ? mockInfo.endpoints as string[] : getApiEndpoints(config);
    const tokenApi = new TokenAPI(endpoints[0], getSessionTimeoutCallback(store));
    await SpaceConnector.init(
        endpoints,
        tokenApi,
        getMockInfo(config),
        getAfterCallApiMap(store),
    );
    const isTokenAlive = SpaceConnector.isTokenAlive;
    store.dispatch('user/setIsSessionExpired', !isTokenAlive);
};
