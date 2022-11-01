import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { camelCase } from 'lodash';

import type {
    SessionTimeoutCallback, APIInfo, MockInfo, AxiosPostResponse,
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
    (data?: any): Promise<void>|void
}

type AfterCallApiMap = Record<string, AfterCallApi>;

const DEFAULT_MOCK_CONFIG = Object.freeze({ mockMode: false });

export class SpaceConnector {
    private static instance: SpaceConnector;

    private apiTokenCheckInterval?: ReturnType<typeof setInterval>;

    private readonly serviceApi: ServiceAPI;

    private readonly tokenApi: TokenAPI;

    private _client: any = {};

    private mockInfo: MockInfo;

    private readonly afterCallApiMap: AfterCallApiMap;

    constructor(
        endpoint: string,
        sessionTimeoutCallback: SessionTimeoutCallback = () => undefined,
        mockInfo: MockInfo,
        afterCallApiMap: AfterCallApiMap,
    ) {
        this.mockInfo = mockInfo;
        this.tokenApi = TokenAPI.getInstance(endpoint, sessionTimeoutCallback);
        this.serviceApi = new ServiceAPI(endpoint, this.tokenApi);
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

    static async init(endpoint: string, sessionTimeoutCallback?: SessionTimeoutCallback, mockInfo: MockInfo = {}, afterCallApiMap: AfterCallApiMap = {}): Promise<void> {
        if (!SpaceConnector.instance) {
            SpaceConnector.instance = new SpaceConnector(endpoint, sessionTimeoutCallback, mockInfo, afterCallApiMap);
            await SpaceConnector.instance.loadAPI();
        }
    }

    static get client(): any {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._client;
        }
        throw new Error('Not initialized SpaceONE client!');
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

    protected async loadAPI(): Promise<void> {
        try {
            let reflectionApi;
            if (this.mockInfo.reflection && this.mockInfo.endpoint) {
                reflectionApi = axios.create({
                    headers: { 'Content-Type': 'application/json' },
                    baseURL: this.mockInfo.endpoint,
                });
            } else {
                reflectionApi = this.serviceApi.instance;
            }
            const response: AxiosPostResponse = await reflectionApi.post(API_REFLECTION_URL);
            response.data.apis.forEach((apiInfo: APIInfo) => {
                this.bindAPIHandler(apiInfo);
            });
        } catch (e: any) {
            throw new Error(`SpaceONE Client LoadAPI Error: ${e.message}`);
        }
    }

    protected bindAPIHandler(apiInfo: APIInfo): void {
        let currentPath = this._client;
        let apiInfoArr = apiInfo.path.split('/');
        apiInfoArr = apiInfoArr.filter(Boolean);

        apiInfoArr.forEach((objPath, idx) => {
            const objCamel = camelCase(objPath.trim());
            if (!currentPath[objCamel]) {
                // Bind APIHandler if last index
                if ((apiInfoArr.length - 1) === idx) {
                    const afterCall = this.afterCallApiMap[apiInfo.path];
                    currentPath[objCamel] = this.APIHandler(apiInfo.path, afterCall);
                } else {
                    currentPath[objCamel] = {};
                }
            }
            currentPath = currentPath[objCamel];
        });
    }

    protected APIHandler(path: string, afterCall: AfterCallApi) {
        if (this.mockInfo.endpoint) {
            return async (params: object = {}, config: MockRequestConfig = DEFAULT_MOCK_CONFIG): Promise<any> => {
                const mockConfig = { ...config };
                let url = path;

                if (this.mockInfo.all || mockConfig.mockMode) {
                    mockConfig.baseURL = this.mockInfo.endpoint;
                    if (mockConfig.mockPath) {
                        url += mockConfig.mockPath;
                    }
                }

                const response: AxiosPostResponse = await this.serviceApi.instance.post(url, params, mockConfig);

                if (afterCall) afterCall(response.data);

                return response.data;
            };
        }
        return async (params: object = {}, config?: AxiosRequestConfig): Promise<any> => {
            const response: AxiosPostResponse = await this.serviceApi.instance.post(path, params, config);

            if (afterCall) afterCall(response.data);

            return response.data;
        };
    }
}
