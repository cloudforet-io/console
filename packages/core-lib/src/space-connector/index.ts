import type { InternalAxiosRequestConfig, CreateAxiosDefaults, Axios } from 'axios';
import axios from 'axios';
import type { CustomAxiosRequestConfig } from 'axios-auth-refresh/dist/utils';
import { camelCase } from 'lodash';

import type {
    APIInfo, MockConfig, AxiosPostResponse, AuthConfig, DevConfig,
} from '@/space-connector/type';

import ServiceAPI from './service-api';
import type TokenAPI from './token-api';

const API_REFLECTION_URL = '/api/reflection';
const API_REFLECTION_URL_V2 = '/console-api/api/reflection';

const CHECK_TOKEN_TIME = 1000 * 30;

interface MockRequestConfig extends CustomAxiosRequestConfig {
    mockMode?: boolean;
    mockPath?: string;
}

interface AfterCallApi {
    (data?: any): Promise<void>|void
}

type AfterCallApiMap = Record<string, AfterCallApi>;


interface ApiHandler {
    <Params = any, Response = any>(params?: Params, config?: CustomAxiosRequestConfig): Promise<Response>;
    [key: string]: ApiHandler;
}
const DEFAULT_MOCK_CONFIG: MockRequestConfig = Object.freeze({ mockMode: false });
export class SpaceConnector {
    private static instance: SpaceConnector;

    private apiTokenCheckInterval?: ReturnType<typeof setInterval>;

    private readonly serviceApi: ServiceAPI;

    private readonly serviceApiV2: ServiceAPI;

    private readonly tokenApi: TokenAPI;

    private _client: any = {};

    private _clientV2: any = {};

    private _restClient: Axios;

    private static mockConfig: MockConfig;

    private static authConfig: AuthConfig;

    private static isDevMode = false;

    private readonly afterCallApiMap: AfterCallApiMap;

    private static interceptorIds: number[] = []; // [v1 id, v2 id]

    constructor(
        endpoints: string[],
        tokenApi: TokenAPI,
        apiSettings: CreateAxiosDefaults[],
        devConfig: DevConfig|undefined,
        afterCallApiMap: AfterCallApiMap,
    ) {
        SpaceConnector.mockConfig = devConfig?.mockConfig ?? {};
        SpaceConnector.authConfig = devConfig?.authConfig ?? {};
        SpaceConnector.isDevMode = devConfig?.enabled ?? false;
        this.tokenApi = tokenApi;
        this.serviceApi = new ServiceAPI(endpoints[0], this.tokenApi, apiSettings[0]);
        const serviceApiV2 = new ServiceAPI(endpoints[1], this.tokenApi, apiSettings[1]);
        this.serviceApiV2 = serviceApiV2;
        this.afterCallApiMap = afterCallApiMap;
        this._restClient = serviceApiV2.instance;
    }

    private setApiTokenCheckInterval() {
        if (this.apiTokenCheckInterval) clearInterval(this.apiTokenCheckInterval);
        this.apiTokenCheckInterval = setInterval(() => this.tokenApi.getActivatedToken(), CHECK_TOKEN_TIME);
    }

    private clearApiTokenCheckInterval() {
        if (this.apiTokenCheckInterval) {
            clearInterval(this.apiTokenCheckInterval);
            this.apiTokenCheckInterval = undefined;
        }
    }

    static async init(
        endpoints: string[],
        tokenApi: TokenAPI,
        apiSettings: CreateAxiosDefaults[] = [],
        devConfig: DevConfig = {},
        afterCallApiMap: AfterCallApiMap = {},
    ): Promise<void> {
        if (!SpaceConnector.instance) {
            SpaceConnector.instance = new SpaceConnector(endpoints, tokenApi, apiSettings, devConfig, afterCallApiMap);
            await Promise.allSettled([
                SpaceConnector.instance.loadAPI(1),
                SpaceConnector.instance.loadAPI(2),
            ]);
        } else {
            throw new Error('Instance already exists');
        }
    }

    static get client(): ApiHandler {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._client;
        }
        throw new Error('Not initialized client!');
    }

    static get clientV2(): ApiHandler {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._clientV2;
        }
        throw new Error('Not initialized client V2!');
    }

    static get restClient(): Axios {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._restClient;
        }
        throw new Error('Not initialized restClient!');
    }

    static setToken(accessToken: string, refreshToken?: string): void {
        SpaceConnector.instance.tokenApi.setToken(accessToken, refreshToken);
        SpaceConnector.instance.setApiTokenCheckInterval();
    }

    static getAccessToken(): string|undefined|null {
        return SpaceConnector.instance.tokenApi.getAccessToken();
    }

    static getRefreshToken(): string|undefined|null {
        return SpaceConnector.instance.tokenApi.getRefreshToken();
    }

    static flushToken(): void {
        SpaceConnector.instance.clearApiTokenCheckInterval();
        SpaceConnector.instance.tokenApi.flushToken();
    }

    static setServiceConfig(serviceConfig: Record<string, any>): void {
        if (SpaceConnector.instance) {
            SpaceConnector.instance.serviceApi.updateServiceConfig(serviceConfig);
            SpaceConnector.instance.serviceApiV2.updateServiceConfig(serviceConfig);
        } else {
            throw new Error('Not initialized client!');
        }
    }

    static async refreshAccessToken(executeSessionTimeoutCallback: boolean): Promise<boolean|undefined> {
        return SpaceConnector.instance.tokenApi.refreshAccessToken(executeSessionTimeoutCallback);
    }

    static get isTokenAlive(): boolean {
        if (SpaceConnector.isDevMode && SpaceConnector.authConfig.enabled && SpaceConnector.authConfig.skipTokenCheck) return true;
        return SpaceConnector.instance.tokenApi.checkToken();
    }

    static setRequestInterceptor(interceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig): void {
        if (SpaceConnector.interceptorIds[0] !== undefined) {
            SpaceConnector.instance.serviceApi.instance.interceptors.request.eject(SpaceConnector.interceptorIds[0]);
        }
        if (SpaceConnector.interceptorIds[1] !== undefined) {
            SpaceConnector.instance.serviceApiV2.instance.interceptors.request.eject(SpaceConnector.interceptorIds[1]);
        }
        SpaceConnector.interceptorIds[0] = SpaceConnector.instance.serviceApi.instance.interceptors.request.use(interceptor);
        SpaceConnector.interceptorIds[1] = SpaceConnector.instance.serviceApiV2.instance.interceptors.request.use(interceptor);
    }

    protected async loadAPI(version: number): Promise<void> {
        try {
            let reflectionApi;
            if (SpaceConnector.isDevMode) {
                const mockEndpoint = SpaceConnector.mockConfig.endpoints?.[version - 1];
                const mockReflection = SpaceConnector.mockConfig.reflection?.[version - 1];
                if (mockReflection) {
                    if (!mockEndpoint) throw new Error(`Mock endpoint for api version ${version} is not defined`);
                    reflectionApi = axios.create({
                        headers: { 'Content-Type': 'application/json' },
                        baseURL: mockEndpoint,
                    });
                } else {
                    reflectionApi = version === 2 ? this.serviceApiV2.instance : this.serviceApi.instance;
                }
            } else {
                reflectionApi = version === 2 ? this.serviceApiV2.instance : this.serviceApi.instance;
            }

            let response: AxiosPostResponse;
            if (version === 2) {
                response = await reflectionApi.get(API_REFLECTION_URL_V2);
            } else {
                response = await reflectionApi.post(API_REFLECTION_URL);
            }
            response.data.apis.forEach((apiInfo: APIInfo) => {
                this.bindAPIHandler(apiInfo, version);
            });
        } catch (e: any) {
            throw new Error(`Api Client LoadAPI Error: ${e.message}`);
        }
    }

    protected bindAPIHandler(apiInfo: APIInfo, version: number): void {
        let currentPath = version === 2 ? this._clientV2 : this._client;
        let apiInfoArr = apiInfo.path.split('/');
        apiInfoArr = apiInfoArr.filter(Boolean);

        apiInfoArr.forEach((objPath, idx) => {
            const objCamel = camelCase(objPath.trim());
            if (!currentPath[objCamel]) {
                // Bind APIHandler if last index
                if ((apiInfoArr.length - 1) === idx) {
                    const afterCall = this.afterCallApiMap[apiInfo.path];
                    currentPath[objCamel] = this.getAPIHandler(apiInfo.path, afterCall, version);
                } else {
                    currentPath[objCamel] = {};
                }
            }
            currentPath = currentPath[objCamel];
        });
    }

    protected getAPIHandler(path: string, afterCall: AfterCallApi, version: number) {
        const serviceApi = version === 2 ? this.serviceApiV2 : this.serviceApi;

        // NOTE: Separate the api handler by environment.
        if (SpaceConnector.isDevMode) {
            const mockEndpoint = SpaceConnector.mockConfig.endpoints?.[version - 1];
            if (!mockEndpoint) throw new Error(`Mock endpoint for api version ${version} is not defined`);
            return async (params: object = {}, config: MockRequestConfig = DEFAULT_MOCK_CONFIG): Promise<any> => {
                const axiosConfig = { ...config };

                // set api key
                if (SpaceConnector.authConfig.enabled && SpaceConnector.authConfig.apiKey) {
                    axiosConfig.headers = Object.assign(
                        axiosConfig.headers ?? {},
                        { Authorization: `Bearer ${SpaceConnector.authConfig.apiKey}` },
                    );
                }

                let url = path;
                if (SpaceConnector.mockConfig.enabled) {
                    const mockApiList = SpaceConnector.mockConfig.apiList?.[version - 1] ?? [];
                    if (isPathIncluded(mockApiList, path) || axiosConfig.mockMode) {
                        axiosConfig.baseURL = mockEndpoint;
                        if (axiosConfig.mockPath) {
                            url += axiosConfig.mockPath;
                        }
                    }
                }

                const response: AxiosPostResponse|undefined = await serviceApi.instance.post(url, params, axiosConfig);

                if (afterCall) afterCall(response?.data ?? {});

                return response?.data ?? {};
            };
        }
        return async (params: object = {}, config?: CustomAxiosRequestConfig): Promise<any> => {
            const response: AxiosPostResponse|undefined = await serviceApi.instance.post(path, params, config);

            if (afterCall) afterCall(response?.data ?? {});

            return response?.data ?? {};
        };
    }
}

const isPathIncluded = (apiList: string[], path: string): boolean => {
    const isExclude = apiList.includes(`!${path}`);
    if (isExclude) return false;

    const isChildrenExcluded = apiList.some((apiPath) => {
        if (apiPath.startsWith('!') && apiPath.endsWith('/*')) {
            const parentPath = apiPath.split('/*')[0]?.slice(1);
            return path.startsWith(parentPath);
        }
        return false;
    });
    if (isChildrenExcluded) return false;

    const isInclude = apiList.includes(path);
    if (isInclude) return true;

    return apiList.some((apiPath) => {
        if (apiPath === '/*' || apiPath === '*') return true;
        if (apiPath.includes('/*')) {
            const parentPath = apiPath.split('/*')[0];
            return path.startsWith(parentPath);
        }
        return false;
    });
};
