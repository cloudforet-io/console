import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { IBaseVariableModel, IEnumVariableModel, IResourceVariableModel } from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


export interface VariableModelMenuHandlerInfo {
    variableModel: IBaseVariableModel|IResourceVariableModel|IEnumVariableModel;
    dataKey?: string;
}

const _getTitle = (modelInfo: VariableModelMenuHandlerInfo) => {
    const _dataKey = modelInfo.dataKey;
    return _dataKey ? modelInfo.variableModel[_dataKey].name : modelInfo.variableModel.meta?.name;
};

export const getVariableModelMenuHandler = (variableModelInfoList: VariableModelMenuHandlerInfo[], options?: Record<string, any>): AutocompleteHandler => {
    const _variableModelInfoList = variableModelInfoList;
    return async (inputText: string, pageStart, pageLimit, filters, resultIndex) => {
        const _query = {
            start: pageStart,
            limit: pageLimit ?? 10,
            search: inputText,
            filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
            options,
        };

        // if resultIndex is empty, it means that the handler is called for the first time. so, we need to call all variableModels' list().
        if (resultIndex === undefined) {
            const responses = await Promise.all(_variableModelInfoList.map(({ variableModel, dataKey }) => {
                if (dataKey) {
                    return variableModel[dataKey].values(_query);
                }
                return variableModel.list(_query);
            }));
            const handlerResults = responses.map((result, resIndex) => ({
                results: result.results.map((d) => ({
                    name: d.key,
                    label: d.name,
                })),
                more: result.more,
                title: _getTitle(_variableModelInfoList[resIndex]),
            }));

            return handlerResults;
        }

        // if resultIndex is given, just call the specific variableModel's list().
        const variableModelInfo = _variableModelInfoList[resultIndex];

        if (!variableModelInfo) {
            ErrorHandler.handleError(new Error(`No variable model found for index ${resultIndex}`));
            return [];
        }
        let response;

        if (variableModelInfo.dataKey) {
            response = await variableModelInfo.variableModel[variableModelInfo.dataKey].values(_query);
        } else {
            response = await variableModelInfo.variableModel.list(_query);
        }
        return _variableModelInfoList.map((modelInfo, i) => {
            if (i !== resultIndex) return { results: [], title: _getTitle(modelInfo) };
            return {
                results: response.results.map((d) => ({
                    name: d.key, label: d.name,
                })),
                more: response.more,
                title: _getTitle(modelInfo),
            };
        });
    };
};
// export const getVariableModelMenuHandler = (variableModel: VariableModel|VariableModel[], options?: Record<string, any>): AutocompleteHandler => {
//     const variableModels = Array.isArray(variableModel) ? variableModel : [variableModel];
//     return async (inputText: string, pageStart, pageLimit, filters, resultIndex) => {
//     // if resultIndex is empty, it means that the handler is called for the first time. so, we need to call all variableModels' list().
//         if (resultIndex === undefined) {
//             const responses = await Promise.all(variableModels.map((varModel) => varModel.list({
//                 start: pageStart,
//                 limit: pageLimit ?? 10,
//                 search: inputText,
//                 filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
//                 options,
//             })));
//             const handlerResults = responses.map((result, resIndex) => ({
//                 results: result.results.map((d) => ({
//                     name: d.key, label: d.name,
//                 })),
//                 more: result.more,
//                 title: variableModels[resIndex].name,
//             }));
//
//             return handlerResults;
//         }
//
//         // if resultIndex is given, just call the specific variableModel's list().
//         const varModel = variableModels[resultIndex];
//
//         if (!varModel) {
//             ErrorHandler.handleError(new Error(`No variable model found for index ${resultIndex}`));
//             return [];
//         }
//
//         const response = await varModel.list({
//             start: pageStart,
//             limit: pageLimit ?? 10,
//             search: inputText,
//             filters: (Array.isArray(filters) && filters.length > 0) ? filters.map((f) => f.name as string) : undefined,
//             options,
//         });
//         return variableModels.map((model, i) => {
//             if (i !== resultIndex) return { results: [], title: model.name };
//             return {
//                 results: response.results.map((d) => ({
//                     name: d.key, label: d.name,
//                 })),
//                 more: response.more,
//                 title: model.name,
//             };
//         });
//     };
// };
