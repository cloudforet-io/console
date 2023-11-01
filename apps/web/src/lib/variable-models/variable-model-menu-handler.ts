import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { VariableModelConfig } from '@/lib/variable-models/index';
import { VariableModel } from '@/lib/variable-models/index';

export const getVariableModelMenuHandler = (config: VariableModelConfig, options?: Record<string, any>): AutocompleteHandler => {
    const variableModel = new VariableModel(config);
    return async (inputText: string, pageStart, pageLimit, filters) => {
        const responses = await variableModel.list({
            start: pageStart,
            limit: pageLimit ?? 10,
            search: inputText,
            filters: filters?.length ? filters.map((f) => f.name as string) : undefined,
            options,
        });
        return {
            results: responses.results.map((result) => ({
                name: result.key, label: result.name,
            })),
            more: responses.more,
        };
    };
};
