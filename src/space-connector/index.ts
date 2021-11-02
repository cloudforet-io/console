import { camelCase } from 'lodash';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import API from '@src/space-connector/api';
import {
    SessionTimeoutCallback, APIInfo, MockInfo, AxiosPostResponse
} from '@src/space-connector/type';

const API_REFLECTION_URL = '/api/reflection';

const CHECK_TOKEN_TIME = 1000 * 30;

export class SpaceConnector {
    private static instance: SpaceConnector;

    private readonly api: API;

    private _client: any = {};

    constructor(endpoint: string, sessionTimeoutCallback: SessionTimeoutCallback = () => undefined, mockInfo: MockInfo) {
        this.api = new API(endpoint, sessionTimeoutCallback, mockInfo);
        try {
            setInterval(() => this.api.getActivatedToken(), CHECK_TOKEN_TIME);
        } catch (e) {
            console.error(e);
        }
    }

    static async init(endpoint: string, sessionTimeoutCallback?: SessionTimeoutCallback, mockInfo: MockInfo = {}): Promise<void> {
        if (!SpaceConnector.instance) {
            SpaceConnector.instance = new SpaceConnector(endpoint, sessionTimeoutCallback, mockInfo);
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
        SpaceConnector.instance.api.setToken(accessToken, refreshToken);
    }

    static flushToken(): void {
        SpaceConnector.instance.api.flushToken();
    }

    static async refreshAccessToken(executeSessionTimeoutCallback: boolean): Promise<boolean> {
        return SpaceConnector.instance.api.refreshAccessToken(executeSessionTimeoutCallback);
    }

    static get isTokenAlive(): boolean {
        return API.checkToken();
    }

    static getExpirationTime(): number {
        return API.getExpirationTime();
    }

    protected async loadAPI(): Promise<void> {
        try {
            const response: AxiosPostResponse = await this.api.instance.post(API_REFLECTION_URL);
            response.data.apis.forEach((apiInfo: APIInfo) => {
                this.bindAPIHandler(apiInfo);
            });
        } catch (e) {
            // @ts-ignore
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
                    currentPath[objCamel] = this.APIHandler(apiInfo.path);
                } else {
                    currentPath[objCamel] = {};
                }
            }
            currentPath = currentPath[objCamel];
        });
    }

    protected APIHandler(path: string) {
        return async (params: object = {}, config?: AxiosRequestConfig): Promise<any> => {
            const response: AxiosPostResponse = await this.api.instance.post(path, params, config);
            return response.data;
        };
    }
}
