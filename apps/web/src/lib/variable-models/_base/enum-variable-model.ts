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

    async list(options: ListQuery = {}): Promise<ListResponse> {
        if (!options.search) {
            this.#response = { results: this.values };
        } else {
            const regex = getTextHighlightRegex(options.search);
            const results = this.values.filter((item) => regex.test(item.name));
            this.#response = { results };
        }
        return this.#response;
    }
}
