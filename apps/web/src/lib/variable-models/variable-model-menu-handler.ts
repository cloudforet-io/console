import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { VariableModel } from '@/lib/variable-models/index';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const getVariableModelMenuHandler = (variableModel: VariableModel|VariableModel[], options?: Record<string, any>): AutocompleteHandler => {
    const variableModels = Array.isArray(variableModel) ? variableModel : [variableModel];
    return async (inputText: string, pageStart, pageLimit, filters, resultIndex) => {
    // if resultIndex is empty, it means that the handler is called for the first time. so, we need to call all variableModels' list().
        if (resultIndex === undefined) {
            const responses = await Promise.all(variableModels.map((varModel) => varModel.list({
                start: pageStart,
                limit: pageLimit ?? 10,
                search: inputText,
                filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
                options,
            })));
            const handlerResults = responses.map((result, resIndex) => ({
                results: result.results.map((d) => ({
                    name: d.key, label: d.name,
                })),
                more: result.more,
                title: variableModels[resIndex].name,
            }));

            return handlerResults;
        }

        // if resultIndex is given, just call the specific variableModel's list().
        const varModel = variableModels[resultIndex];

        if (!varModel) {
            ErrorHandler.handleError(new Error(`No variable model found for index ${resultIndex}`));
            return [];
        }

        const response = await varModel.list({
            start: pageStart,
            limit: pageLimit ?? 10,
            search: inputText,
            filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
            options,
        });
        return variableModels.map((model, i) => {
            if (i !== resultIndex) return { results: [], title: model.name };
            return {
                results: response.results.map((d) => ({
                    name: d.key, label: d.name,
                })),
                more: response.more,
                title: model.name,
            };
        });
    };
};
