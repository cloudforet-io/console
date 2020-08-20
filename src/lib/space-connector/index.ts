import _ from 'lodash';
import { QueryHelper } from '@/lib/space-connector/helper';
import API from './api';
import { SessionTimeoutCallback, APIInfo } from './type';

const API_REFLECTION_URL = '/api/reflection';

class SpaceConnector {
    private static instance: SpaceConnector;

    private readonly api: API;

    private _client: any = {};

    constructor(endpoint: string, sessionTimeoutCallback: SessionTimeoutCallback = () => undefined, userStore?: any) {
        this.api = new API(endpoint, sessionTimeoutCallback, userStore);
    }

    static async init(endpoint: string, sessionTimeoutCallback?: SessionTimeoutCallback, userStore?: any): Promise<void> {
        if (!SpaceConnector.instance) {
            SpaceConnector.instance = new SpaceConnector(endpoint, sessionTimeoutCallback, userStore);
            await SpaceConnector.instance.loadAPI();
        }
    }

    static get client(): any {
        if (SpaceConnector.instance) {
            return SpaceConnector.instance._client;
        }
        throw new Error('Not initialized SpaceONE client!');
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
        return async (params: object = {}): Promise<any> => {
            try {
                const response = await this.api.instance.post(path, params);
                return response.data;
            } catch (e) {
                throw e;
            }
        };
    }
}

export {
    SpaceConnector,
    QueryHelper,
};
