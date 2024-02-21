import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import EnumVariableModel from './_base/enum-variable-model';
import type {
    IBaseVariableModel, ListQuery, ListResponse,
    EnumVariableModelConfig,
    ResourceVariableModelConfig,
} from './_base/types';


// config
export interface ManagedVariableModelConfig {
    type: 'MANAGED';
    key: ManagedVariableModelKey;
    dataKey?: string;
    name?: string;
}
export interface VariableModelAdditionalConfig {
    scope?: IBaseVariableModel['scope'];
    labels?: IBaseVariableModel['labels'];
}
export type CustomVariableModelConfig = EnumVariableModelConfig|ResourceVariableModelConfig;
export type VariableModelConfig = ManagedVariableModelConfig|CustomVariableModelConfig;
export type VariableModelConfigType = 'MANAGED'|'ENUM'|'RESOURCE';

export class VariableModel implements IBaseVariableModel {
    key: string;

    name: string;

    scope: IBaseVariableModel['scope'];

    // labelsSchema: IBaseVariableModel['labelsSchema'];

    // labels: IBaseVariableModel['labels'];

    #model: IBaseVariableModel;

    #type: VariableModelConfigType;

    constructor(config: VariableModelConfig, additionalConfig?: VariableModelAdditionalConfig) {
        if (config.type === 'MANAGED') {
            if (!config.key) throw new Error('key is required');
            const Model = MANAGED_VARIABLE_MODELS[config.key];
            this.#model = new Model();
        } else if (config.type === 'RESOURCE') {
            this.#model = new ResourceVariableModel(config);
        } else if (config.type === 'ENUM') {
            this.#model = new EnumVariableModel(config);
        } else {
            throw new Error(`Invalid config type for VariableModel: ${(config as any).type}`);
        }

        this.key = this.#model.key;
        this.name = config.name ?? (this.#model.name || this.#model.key);
        this.#type = config.type;
    }

    get type() {
        return this.#type;
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        return this.#model.list(query);
    }
}

