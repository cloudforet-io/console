import { getTextHighlightRegex } from '@spaceone/design-system';

import type {
    ListResponse, ListOptions,
    VariableModelLabel, IEnumVariableModel,
} from '@/lib/variable-models/_base/types';

export class EnumVariableModel implements IEnumVariableModel {
    key = '';

    name = '';

    labels: VariableModelLabel[] = [];

    values: IEnumVariableModel['values'] = [];

    #response: ListResponse = { results: [] };

    constructor(config?: IEnumVariableModel) {
        if (!config) return;
        if (!config.values) throw new Error('VariableModelBaseConfig.values is required');
        this.key = config.key;
        this.name = config.name ?? config.key;
        this.labels = config.labels ?? [];
        this.values = config.values;
    }

    async list(options: ListOptions = {}): Promise<ListResponse> {
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
