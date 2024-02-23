import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type {
    IBaseVariableModel, ListQuery, ResourceVariableModelConstructorOptions, VariableModelConstructorConfig,
    ListResponse,
} from '@/lib/variable-models/_base/types';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';


export type VariableModelType = 'ENUM'|'RESOURCE'|'MANAGED';
export interface VariableModelFactoryConfig {
    type: VariableModelType;
    managedModelKey?: ManagedVariableModelKey;
}

export class VariableModelFactory implements IBaseVariableModel {
    meta: IBaseVariableModel['meta'];

    #model: IBaseVariableModel;

    constructor(config: VariableModelFactoryConfig, modelConfig?: VariableModelConstructorConfig, modelOptions?: ResourceVariableModelConstructorOptions) {
        if (config.type === 'MANAGED' && !config.managedModelKey) throw new Error('managedModelKey is required');
        const type = config.type;

        if (type === 'MANAGED') {
            const Model = MANAGED_VARIABLE_MODELS[config.managedModelKey as string];
            this.#model = new Model(modelConfig, modelOptions);
        } else if (type === 'RESOURCE') {
            this.#model = new ResourceVariableModel(modelConfig, modelOptions);
        } else if (type === 'ENUM') {
            this.#model = new EnumVariableModel(modelConfig);
        } else {
            throw new Error(`Invalid config type for VariableModel: ${config.type}`);
        }


        this.meta = this.#model.meta;
        const _properties = this.#model.properties ?? [];

        _properties.forEach((property) => {
            Object.defineProperty(this, property, {
                get: () => this.#model[property],
            });
        });
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        return this.#model.list(query);
    }
}
