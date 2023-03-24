import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { camelCase } from 'lodash';

import type {
    APIInfo, MockInfo, AxiosPostResponse,
} from '@/space-connector/type';

import ServiceAPI from './service-api';
import TokenAPI from './token-api';

const API_REFLECTION_URL = '/api/reflection';

const CHECK_TOKEN_TIME = 1000 * 30;

interface MockRequestConfig extends AxiosRequestConfig {
    mockMode?: boolean;
    mockPath?: string;
}

interface AfterCallApi {
    // eslint-disable-next-line no-unused-vars
    (data?: any): Promise<void>|void
}

type AfterCallApiMap = Record<string, AfterCallApi>;

const DEFAULT_MOCK_CONFIG = Object.freeze({ mockMode: false });

export class SpaceConnector {
    private static instance: SpaceConnector;

    private apiTokenCheckInterval?: ReturnType<typeof setInterval>;

    private readonly serviceApi: ServiceAPI;

    private readonly serviceApiV2: ServiceAPI;

    private readonly tokenApi: TokenAPI;

    private _client: any = {};

    private _clientV2: any = {};

    private mockInfo: MockInfo;

    private readonly afterCallApiMap: AfterCallApiMap;

    constructor(
        endpoints: string[],
        tokenApi: TokenAPI,
        mockInfo: MockInfo,
        afterCallApiMap: AfterCallApiMap,
    ) {
        this.mockInfo = mockInfo;
        this.tokenApi = tokenApi;
        this.serviceApi = new ServiceAPI(endpoints[0], this.tokenApi);
        this.serviceApiV2 = new ServiceAPI(endpoints[1], this.tokenApi);
        this.afterCallApiMap = afterCallApiMap;
        this.setApiTokenCheckInterval();
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

    static async init(endpoints: string[], tokenApi: TokenAPI, mockInfo: MockInfo = {}, afterCallApiMap: AfterCallApiMap = {}): Promise<void> {
        if (!SpaceConnector.instance) {
            SpaceConnector.instance = new SpaceConnector(endpoints, tokenApi, mockInfo, afterCallApiMap);
            await Promise.allSettled([
                SpaceConnector.instance.loadAPI(1),
                SpaceConnector.instance.loadAPI(2),
            ]);
        } else {
            throw new Error('Instance already exists');
        }
    }

    static get client(): any {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._client;
        }
        throw new Error('Not initialized client!');
    }

    static get clientV2(): any {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._clientV2;
        }
        throw new Error('Not initialized client V2!');
    }

    static setToken(accessToken: string, refreshToken: string): void {
        SpaceConnector.instance.tokenApi.setToken(accessToken, refreshToken);
        SpaceConnector.instance.setApiTokenCheckInterval();
    }

    static flushToken(): void {
        SpaceConnector.instance.clearApiTokenCheckInterval();
        SpaceConnector.instance.tokenApi.flushToken();
    }

    static async refreshAccessToken(executeSessionTimeoutCallback: boolean): Promise<boolean|undefined> {
        return SpaceConnector.instance.tokenApi.refreshAccessToken(executeSessionTimeoutCallback);
    }

    static get isTokenAlive(): boolean {
        return TokenAPI.checkToken();
    }

    protected async loadAPI(version: number): Promise<void> {
        try {
            let reflectionApi;
            const mockEndpoint = this.mockInfo.endpoints?.[version - 1];
            if (this.mockInfo.reflection && mockEndpoint) {
                reflectionApi = axios.create({
                    headers: { 'Content-Type': 'application/json' },
                    baseURL: mockEndpoint,
                });
            } else {
                reflectionApi = version === 2 ? this.serviceApiV2.instance : this.serviceApi.instance;
            }

            let response: AxiosPostResponse;
            if (version === 2) {
                response = await reflectionApi.get(API_REFLECTION_URL);
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
                    currentPath[objCamel] = this.APIHandler(apiInfo.path, afterCall, version);
                } else {
                    currentPath[objCamel] = {};
                }
            }
            currentPath = currentPath[objCamel];
        });
    }

    protected APIHandler(path: string, afterCall: AfterCallApi, version: number) {
        const mockEndpoint = this.mockInfo.endpoints?.[version - 1];
        const serviceApi = version === 2 ? this.serviceApiV2 : this.serviceApi;
        if (mockEndpoint) {
            return async (params: object = {}, config: MockRequestConfig = DEFAULT_MOCK_CONFIG): Promise<any> => {
                const mockConfig = { ...config };
                let url = path;

                if (this.mockInfo.all || mockConfig.mockMode) {
                    mockConfig.baseURL = mockEndpoint;
                    if (mockConfig.mockPath) {
                        url += mockConfig.mockPath;
                    }
                }

                const response: AxiosPostResponse = await serviceApi.instance.post(url, params, mockConfig);

                if (afterCall) afterCall(response.data);

                return response.data;
            };
        }
        return async (params: object = {}, config?: AxiosRequestConfig): Promise<any> => {
            const response: AxiosPostResponse = await serviceApi.instance.post(path, params, config);

            if (afterCall) afterCall(response.data);

            return response.data;
        };
    }
}
