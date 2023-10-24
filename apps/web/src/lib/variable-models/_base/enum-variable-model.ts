import { getTextHighlightRegex } from '@spaceone/design-system';

import type {
    BaseVariableModelConfig, Field,
    ListResponse, BaseListOptions, VariableModelType,
} from '@/lib/variable-models/_base/base-variable-model';
import { BaseVariableModel } from '@/lib/variable-models/_base/base-variable-model';

export interface EnumVariableModelConfig extends BaseVariableModelConfig {
    values: Field[];
}

export class EnumVariableModel extends BaseVariableModel<EnumVariableModelConfig, BaseListOptions> {
    modelType: VariableModelType = 'ENUM';

    values: EnumVariableModelConfig['values'];

    constructor(config: EnumVariableModelConfig) {
        super(config);
        if (!config.values) throw new Error('VariableModelBaseConfig.values is required');
        this.values = config.values;
    }

    async list(options: BaseListOptions = {}): Promise<ListResponse> {
        if (!options.search) {
            this.response = { results: this.values };
        } else {
            const regex = getTextHighlightRegex(options.search);
            const results = this.values.filter((item) => regex.test(item.name));
            this.response = { results };
        }
        return this.response;
    }
}
