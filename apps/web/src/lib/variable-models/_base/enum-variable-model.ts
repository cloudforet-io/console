import { getTextHighlightRegex } from '@spaceone/design-system';

import type {
    ListResponse, ListQuery, IEnumVariableModel,
    EnumVariableModelConfig,
    VariableModelLabel,
} from '@/lib/variable-models/_base/types';

export default class EnumVariableModel implements IEnumVariableModel {
    key = '';

    name = '';

    labels: VariableModelLabel[] = [];

    values: IEnumVariableModel['values'] = [];

    #response: ListResponse = { results: [] };

    constructor(config?: EnumVariableModelConfig) {
        if (!config) return;
        if (!config.values) throw new Error('values is required');
        if (config.name) this.name = config.name;
        this.values = config.values;
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        let results = this.values;
        const filters = query.filters;
        if (filters?.length) {
            results = results.filter((item) => filters.includes(item.key));
        }
        if (query.search) {
            const regex = getTextHighlightRegex(query.search);
            results = results.filter((item) => regex.test(item.name));
        }
        this.#response = { results };
        return this.#response;
    }
}
