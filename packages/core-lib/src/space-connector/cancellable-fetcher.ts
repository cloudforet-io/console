import type { CancelTokenSource } from 'axios';
import axios from 'axios';

import type { MockRequestConfig } from '@/space-connector';


interface CancelledResponse {
    status: 'cancelled';
    response: undefined;
}
interface SucceedResponse<T> {
    status: 'succeed';
    response: T;
}
type CancellableFetcherResponse<T> = CancelledResponse|SucceedResponse<T>;

interface Fetcher<Param, Res> {
    (params: Param, config?: MockRequestConfig): Promise<Res>
}

export interface CancellableFetcher<Param, Res> {
    (params: Param, config?: MockRequestConfig): Promise<CancellableFetcherResponse<Res>>
}

export function getCancellableFetcher<Param extends Record<string, any> = Record<string, any>, Res = any>(fetcher: Fetcher<Param, Res>): CancellableFetcher<Param, Res> {
    let cancelTokenSource: CancelTokenSource|undefined;

    return async (params: Param, config?: MockRequestConfig) => {
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
