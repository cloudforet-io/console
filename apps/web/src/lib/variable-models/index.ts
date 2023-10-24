import { ResourceValueVariableModel } from '@/lib/variable-models/_base/resource-value-variable-model';

import { EnumVariableModel } from './_base/enum-variable-model';
import type {
    IBaseVariableModel, ListOptions, ListResponse, VariableModelLabel,
    IEnumVariableModel, IResourceValueVariableModel,
} from './_base/types';
import MANAGED_VARIABLE_MODELS from './managed';

export type ManagedVariableModelKey = keyof typeof MANAGED_VARIABLE_MODELS;

// config
export interface ManagedVariableModelConfig {
    key: ManagedVariableModelKey;
    name?: string;
}
export type CustomVariableModelConfig = IEnumVariableModel|IResourceValueVariableModel;
export type VariableModelConfig = ManagedVariableModelConfig|CustomVariableModelConfig;


export class VariableModel implements IBaseVariableModel {
    key: string;

    name: string;

    labels: VariableModelLabel[];

    #model: IBaseVariableModel;

    #type: 'MANAGED'|'CUSTOM';

    constructor(config: VariableModelConfig) {
        if (config.key && MANAGED_VARIABLE_MODELS[config.key]) {
            this.#type = 'MANAGED';
            const Model = MANAGED_VARIABLE_MODELS[config.key];
            this.#model = new Model({ key: config.key, name: config.key });
        } else {
            this.#type = 'CUSTOM';
            if ((config as IResourceValueVariableModel).resourceType) {
                this.#model = new ResourceValueVariableModel(config as IResourceValueVariableModel);
            } else if ((config as IEnumVariableModel).values) {
                this.#model = new EnumVariableModel(config as IEnumVariableModel);
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

    get dataSetKeys() {
        return this.#model.dataSetKeys;
    }

    async list(options: ListOptions = {}): Promise<ListResponse> {
        return this.#model.list(options);
    }
}

