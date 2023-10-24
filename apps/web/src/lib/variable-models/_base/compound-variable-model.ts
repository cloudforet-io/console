import { union } from 'lodash';

import type {
    ListResponse,
    BaseVariableModelConfig,
    VariableModelLabel,
    VariableModelType,
} from '@/lib/variable-models/_base/base-variable-model';
import type { EnumVariableModel } from '@/lib/variable-models/_base/enum-variable-model';
import type {
    SearchResourceListOptions,
    SearchResourceVariableModel,
} from '@/lib/variable-models/_base/search-resource-variable-model';

export type CompoundPossibleVariableModel = SearchResourceVariableModel|EnumVariableModel;
export interface CompoundVariableModelConfig extends BaseVariableModelConfig {
    models: CompoundPossibleVariableModel[];
}
export interface CompoundListOptions extends SearchResourceListOptions {
    modelRef?: number;
}

export class CompoundVariableModel {
    key: string;

    name?: string;

    labels: VariableModelLabel[];

    modelType: VariableModelType = 'COMPOUND';

    variableModels: Array<CompoundPossibleVariableModel>;

    responses: ListResponse[] = [];

    constructor(config: CompoundVariableModelConfig) {
        if (!config.models) throw new Error('CompoundVariableModelConfig.models is required');
        this.variableModels = config.models;
        const labels = union<VariableModelLabel>(
            config.labels ?? [],
            config.models.map((model) => model.labels).flat(),
        );
        this.key = config.key;
        this.name = config.name;
        this.labels = labels;
    }

    async list(options: CompoundListOptions = {}): Promise<ListResponse> {
        if (options.modelRef === undefined) {
            throw new Error('list() requires modelRef');
        }
        if (!this.variableModels[options.modelRef]) {
            throw new Error(`Invalid modelRef: ${options.modelRef}`);
        }
        const response = await this.variableModels[options.modelRef].list(options);
        this.responses[options.modelRef] = response;
        return this.responses[options.modelRef];
    }

    async listAll(options: CompoundListOptions = {}): Promise<ListResponse[]> {
        const promiseResults = await Promise.allSettled(this.variableModels.map((model) => model.list(options)));
        const responses: ListResponse[] = [];
        promiseResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                responses.push(result.value[0]);
            } else {
                console.error(result.reason);
            }
        }, [] as ListResponse[]);

        this.responses = responses.flat();

        return this.responses;
    }
}
