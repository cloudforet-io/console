import type { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axios from 'axios';


interface CancelledResponse {
    status: 'cancelled';
    response: undefined;
}
interface SucceedResponse<T> {
    status: 'succeed';
    response: T;
}
type CancellableFetcherResponse<T> = CancelledResponse|SucceedResponse<T>;

interface Fetcher {
    (params: object, config?: AxiosRequestConfig): Promise<any>
}

interface CancellableFetcher<T = any> {
    (params: object, config?: AxiosRequestConfig): Promise<CancellableFetcherResponse<T>>
}

export function getCancellableFetcher<T = any>(fetcher: Fetcher): CancellableFetcher<T> {
    let cancelTokenSource: CancelTokenSource|undefined;

    return async (params: object, config?: AxiosRequestConfig) => {
        try {
            if (cancelTokenSource) {
                cancelTokenSource.cancel('[getCancellableFetcher] Next request has been called.');
                cancelTokenSource = undefined;
            }
            cancelTokenSource = axios.CancelToken.source();

            const mergedConfig = {
                ...config,
                cancelToken: cancelTokenSource.token,
            };
            const res = await fetcher(params, mergedConfig);

            cancelTokenSource = undefined;

            return { status: 'succeed', response: res };
        } catch (e: any) {
            if (!axios.isCancel(e.axiosError)) {
                throw e;
            }
            return { status: 'cancelled', response: undefined };
        }
    };
}
