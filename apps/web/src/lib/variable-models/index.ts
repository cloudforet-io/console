import EnumVariableModel from './_base/enum-variable-model';
import ResourceValueVariableModel from './_base/resource-value-variable-model';
import type {
    IBaseVariableModel, ListQuery, ListResponse, VariableModelLabel,
    EnumVariableModelConfig, ResourceValueVariableModelConfig,
} from './_base/types';
import type { ManagedVariableModelKey } from './managed';
import MANAGED_VARIABLE_MODELS from './managed';

// config
export interface ManagedVariableModelConfig {
    type: 'MANAGED';
    key: ManagedVariableModelKey;
    name?: string;
}
export type CustomVariableModelConfig = EnumVariableModelConfig|ResourceValueVariableModelConfig;
export type VariableModelConfig = ManagedVariableModelConfig|CustomVariableModelConfig;
export type VariableModelConfigType = 'MANAGED'|'ENUM'|'RESOURCE_VALUE';

export class VariableModel implements IBaseVariableModel {
    key: string;

    name: string;

    labels: VariableModelLabel[];

    #model: IBaseVariableModel;

    #type: VariableModelConfigType;

    constructor(config: VariableModelConfig) {
        if (config.type === 'MANAGED') {
            if (!config.key) throw new Error('key is required');
            const Model = MANAGED_VARIABLE_MODELS[config.key];
            this.#model = new Model();
        } else if (config.type === 'RESOURCE_VALUE') {
            this.#model = new ResourceValueVariableModel(config);
        } else if (config.type === 'ENUM') {
            this.#model = new EnumVariableModel(config);
        } else {
            throw new Error(`Invalid config type for VariableModel: ${(config as any).type}`);
        }

        this.key = this.#model.key;
        this.name = config.name ?? (this.#model.name || this.#model.key);
        this.labels = this.#model.labels;
        this.#type = config.type;
    }

    get type() {
        return this.#type;
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        return this.#model.list(query);
    }
}

