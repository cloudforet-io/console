import _ from 'lodash';
import { AxiosRequestConfig } from 'axios';
import API from '@/space-connector/api';
import { SessionTimeoutCallback, APIInfo, MockInfo } from '@/space-connector/type';

const API_REFLECTION_URL = '/api/reflection';

export class SpaceConnector {
    private static instance: SpaceConnector;

    private readonly api: API;

    private _client: any = {};

    constructor(endpoint: string, sessionTimeoutCallback: SessionTimeoutCallback = () => undefined, mockInfo: MockInfo) {
        this.api = new API(endpoint, sessionTimeoutCallback, mockInfo);
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

    static get refreshToken(): string|undefined {
        return SpaceConnector.instance.api.getRefreshToken();
    }

    static get isTokenAlive(): boolean {
        return API.checkToken();
    }

    static getExpirationTime(): number {
        return API.getExpirationTime();
    }

    protected async loadAPI(): Promise<void> {
        try {
            const response = await this.api.instance.post(API_REFLECTION_URL);
            response.data.apis.forEach((apiInfo: APIInfo) => {
                this.bindAPIHandler(apiInfo);
            });
        } catch (e) {
            throw new Error(`SpaceONE Client LoadAPI Error: ${e.message}`);
        }
    }

    protected bindAPIHandler(apiInfo: APIInfo): void {
        let currentPath = this._client;
        let apiInfoArr = apiInfo.path.split('/');
        apiInfoArr = apiInfoArr.filter(Boolean);

        apiInfoArr.forEach((objPath, idx) => {
            const objCamel = _.camelCase(objPath.trim());
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
            try {
                const response = await this.api.instance.post(path, params, config);
                return response.data;
            } catch (e) {
                throw e;
            }
        };
    }
}
