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
        let more = false;
        if (filters?.length) {
            results = results.filter((item) => filters.includes(item.key));
        }
        if (query.search) {
            const regex = getTextHighlightRegex(query.search);
            results = results.filter((item) => regex.test(item.name));
        }
        if (query.start !== undefined && query.limit !== undefined) {
            const end = query.start + query.limit;
            results = results.slice(query.start, end);
            more = end < results.length + 1;
        }
        this.#response = { results, more };
        return this.#response;
    }
}
