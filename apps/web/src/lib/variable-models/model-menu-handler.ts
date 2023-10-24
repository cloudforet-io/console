import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { IResourceValueVariableModel, ListOptions } from '@/lib/variable-models/_base/types';
import type { VariableModelConfig } from '@/lib/variable-models/index';
import { VariableModel } from '@/lib/variable-models/index';

export const getVariableModelMenuHandler = (config: VariableModelConfig): AutocompleteHandler[] => {
    const variableModel = new VariableModel(config);
    const resourceType: string|undefined = (variableModel as unknown as IResourceValueVariableModel).resourceType;
    const variableListHandlers = getListHandlers(variableModel);
    const handlers: AutocompleteHandler[] = variableListHandlers.map((handler) => async (inputText: string, pageStart, pageLimit, filters) => {
        const responses = await handler({
            // TODO: implement pagination after api is ready
            limit: 10,
            search: inputText,
            filter: filters?.length ? [{
                k: resourceType,
                v: filters.map((f) => f.name),
                o: 'in',
            }] : undefined,
        });
        return {
            results: responses.results.map((result) => ({
                name: result.key, label: result.name,
            })),
            more: responses.more,
        };
    });
    return handlers;
};

const getListHandlers = (model: VariableModel) => {
    if (Array.isArray(model.dataSetKeys)) {
        return model.dataSetKeys.map((key) => async (options: ListOptions) => {
            const listOptions = { ...options, dataSetKey: key };
            return model.list(listOptions);
        });
    }
    return [model.list];
};
