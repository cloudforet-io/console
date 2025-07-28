import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { Page } from '@/api-clients/_common/schema/type';

type LoadParams = Record<string, unknown> & {
    page?: Page;
};


export const omitPageFromLoadParams = <T extends LoadParams>(params: T): Omit<T, 'page'> => {
    const copiedParams = { ...params };
    delete copiedParams.page;
    return copiedParams;
};

type QueryParams = Record<string, unknown> & {
    query?: Query;
};

export const omitPageQueryParams = (params: QueryParams) => {
    const copiedQuery = params.query ? { ...params.query } : undefined;
    if (copiedQuery) delete copiedQuery.page;

    return {
        ...params,
        query: copiedQuery,
    };
};

const _addPageToLoadParams = (
    params: LoadParams,
    page: Page,
): LoadParams => ({
    ...params,
    page,
});

const _addPageToListParams = (
    params: QueryParams,
    page: Page,
): QueryParams => ({
    ...params,
    query: {
        ...(params.query ?? {}),
        page,
    },
});

export const addPageToVerbParams = <TParams extends object>(
    verb: 'load' | 'list' | 'analyze' | 'stat' | 'get-data' | 'find',
    params: TParams,
    page: Page,
): TParams => {
    switch (verb) {
    case 'load':
        return _addPageToLoadParams(params as LoadParams, page) as TParams;
    case 'list':
    case 'analyze':
    case 'stat':
    case 'get-data':
        return _addPageToListParams(params as QueryParams, page) as TParams;
    default:
        console.warn(`[addPageToVerbParams] Unsupported verb: ${verb}`);
        return params;
    }
};
