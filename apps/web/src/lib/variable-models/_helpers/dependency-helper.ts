import type { IBaseVariableModel, ListQuery } from '@/lib/variable-models/_base/types';

/* get refined dependency options for api query
* e.g. ({ cost_data_source: 'data_source_id' }, { cost_data_source: '123' }) => { data_source_id: '123' }
*/
export const getRefinedDependencyOptions = (
    dependencies: IBaseVariableModel['dependencies'],
    options: ListQuery['options'],
): Record<string, string> => {
    if (!dependencies) return {};

    const dependencyOptions = {};
    Object.entries(dependencies).forEach(([variableModelKey, queryKey]) => {
        const dependencyValue = options?.[variableModelKey];
        if (!dependencyValue) throw new Error(`No dependency value for '${variableModelKey}'`);
        dependencyOptions[queryKey] = options?.[variableModelKey];
    });

    return dependencyOptions;
};
