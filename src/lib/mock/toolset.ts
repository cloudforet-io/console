import { AxiosRequestConfig } from 'axios';
import { getConfigParseResult } from 'ts-loader/dist/config';


type methods = 'POST'|'GET'|'PUT'|'DELETE'|'ANY';
export type checkRequestData = (AxiosRequestConfig) => boolean;
export type responseData = (AxiosRequestConfig) => any;

type requestDataArg = null | checkRequestData;
export class MockData {
    constructor(public path: string|RegExp, public data: responseData = () => ({}), public requestData: requestDataArg = null, public status: number = 200, public method: methods = 'POST') { }

    makeResponse(config: AxiosRequestConfig) {
        const response = [this.status, this.data(config)];
        console.debug('response', config.url, this.path, response);
        return response;
    }

    protected matchMethod(method: string) {
        return this.method === 'ANY' ? true : method.toUpperCase() === this.method;
    }

    protected matchUrl(url: string) {
        if (this.path instanceof RegExp) {
            return url.search(this.path) !== -1;
        }
        return url === this.path;
    }

    protected matchRequestData(config: AxiosRequestConfig): boolean {
        return this.requestData ? this.requestData(config) : true;
    }

    isMatch(config: AxiosRequestConfig): boolean {
        if (this.matchMethod(config.method as string) && this.matchUrl(config.url as string) && this.matchRequestData(config)) {
            return true;
        }
        return false;
    }
}

export const makeArrayResults = (results: any[] = [], totalCount: null|number = null) => ({
    results,
    // eslint-disable-next-line camelcase
    total_count: totalCount !== null ? totalCount : results.length,
});
