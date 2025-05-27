import type { Ref } from 'vue';
import { isRef } from 'vue';

import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { ReferenceQueryParams, ReferenceQueryResponse } from '@/query/reference/types/reference-query-type';

import ErrorHandler from '@/common/composables/error/errorHandler';



export interface ReferenceModelMenuHandlerInfo {
    fetchFn: (params?: ReferenceQueryParams) => Promise<ReferenceQueryResponse<any>>;
    title?: string;
}

type Options = Record<string, any>;
interface Item<T> {
    label: string;
    name: string;
    data: T;
}
export const getReferenceModelMenuHandler = <T=any>(referenceModelInfoList: ReferenceModelMenuHandlerInfo[], options: Options|Ref<Options> = {}): MenuAttachHandler<Item<T>> => {
    const _referenceModelInfoList = referenceModelInfoList;
    return async (inputText: string, pageStart, pageLimit, filters, resultIndex) => {
        const _query = {
            start: pageStart,
            limit: pageLimit ?? 10,
            search: inputText,
            filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
            options: isRef<Options>(options) ? options.value : options,
        };

        // if resultIndex is empty, it means that the handler is called for the first time. so, we need to call all referenceModels' list().
        if (resultIndex === undefined) {
            const responses = await Promise.all(_referenceModelInfoList.map(({ fetchFn }) => fetchFn(_query)));
            const handlerResults = responses.map((result, resIndex) => ({
                results: result.results.map((d) => ({
                    name: d.key,
                    label: d.name,
                    data: d.data,
                })),
                more: result.more,
                title: _referenceModelInfoList[resIndex].title || result.title,
            }));

            return handlerResults;
        }

        // if resultIndex is given, just call the specific referenceModel's list().
        const referenceModelInfo = _referenceModelInfoList[resultIndex];

        if (!referenceModelInfo) {
            ErrorHandler.handleError(new Error(`No reference model found for index ${resultIndex}`));
            return [];
        }
        const response = await referenceModelInfo.fetchFn(_query);
        if (!response) {
            ErrorHandler.handleError(new Error(`No response from reference model for index ${resultIndex}`));
            return [];
        }
        return _referenceModelInfoList.map((modelInfo, i) => {
            if (i !== resultIndex) return { results: [], title: response.title || modelInfo.title };
            return {
                results: response.results.map((d) => ({
                    name: d.key, label: d.name, data: d.data,
                })),
                more: response.more,
                title: response.title || modelInfo.title,
            };
        });
    };
};

