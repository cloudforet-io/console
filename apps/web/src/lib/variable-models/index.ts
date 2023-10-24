
import type {
    ListResponse, VariableModelLabel,
} from './_base/base-variable-model';
import type {
    CompoundListOptions,
    CompoundPossibleVariableModel,
    CompoundVariableModel,
} from './_base/compound-variable-model';
import type { EnumVariableModelConfig } from './_base/enum-variable-model';
import { EnumVariableModel } from './_base/enum-variable-model';
import type {
    SearchResourceListOptions,
    SearchResourceVariableModelConfig,
} from './_base/search-resource-variable-model';
import { SearchResourceVariableModel } from './_base/search-resource-variable-model';
import managedCompoundVariableModels from './compound-variable-models';
import managedEnumVariableModels from './enum-variable-models';
import managedSearchResourceVariableModels from './search-resource-variable-models';

// managed variable models
const MANAGED_VARIABLE_MODELS = {
    ...managedCompoundVariableModels,
    ...managedEnumVariableModels,
    ...managedSearchResourceVariableModels,
};
export type ManagedVariableModelKey = keyof typeof MANAGED_VARIABLE_MODELS;
export interface ManagedVariableModelConfig {
    key: ManagedVariableModelKey;
    name?: string;
}
type ManagedVariableModel = CompoundVariableModel|SearchResourceVariableModel|EnumVariableModel;

// custom variable model
type CustomVariableModel = SearchResourceVariableModel|EnumVariableModel;
export type CustomVariableModelConfig = SearchResourceVariableModelConfig|EnumVariableModelConfig;

// variable model
export type VariableModelConfig = ManagedVariableModelConfig|CustomVariableModelConfig;
export type VariableModelListOptions = CompoundListOptions|SearchResourceListOptions;

export class VariableModel {
    key: string;

    name: string;

    labels: VariableModelLabel[];

    response: ListResponse = { results: [] };

    #model: ManagedVariableModel|CustomVariableModel;

    #type: 'MANAGED'|'CUSTOM';

    constructor(config: VariableModelConfig) {
        if (config.key && MANAGED_VARIABLE_MODELS[config.key]) {
            this.#type = 'MANAGED';
            const Model = MANAGED_VARIABLE_MODELS[config.key];
            this.#model = new Model({ key: config.key, name: config.key });
        } else {
            this.#type = 'CUSTOM';
            if ((config as SearchResourceVariableModelConfig).resourceType) {
                this.#model = new SearchResourceVariableModel(config as SearchResourceVariableModelConfig);
            } else if ((config as EnumVariableModelConfig).values) {
                this.#model = new EnumVariableModel(config as EnumVariableModelConfig);
            } else {
                throw new Error('Invalid config');
            }
        }
        this.key = this.#model.key;
        this.name = this.#model.name ?? this.#model.key;
        this.labels = this.#model.labels;
    }

    get type() {
        return this.#type;
    }

    get modelType() {
        return this.#model.modelType;
    }

    get models(): CompoundPossibleVariableModel[] {
        if (this.#model.modelType === 'COMPOUND') {
            return (this.#model as CompoundVariableModel).variableModels;
        }
        return [this.#model as CompoundPossibleVariableModel];
    }

    get listHandlers() {
        return this.models.map((model) => model.list);
    }
}

