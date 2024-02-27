import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type {
    IBaseVariableModel, ListQuery, ResourceVariableModelConstructorOptions, VariableModelConstructorConfig,
    ListResponse,
    PropertyObject, PropertyOptions,
} from '@/lib/variable-models/_base/types';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

// Variable Model Type : if not MANAGED, then it is CUSTOM (ENUM or RESOURCE)
export type VariableModelType = 'ENUM'|'RESOURCE'|'MANAGED';
export interface VariableModelFactoryConfig {
    type: VariableModelType;
    managedModelKey?: ManagedVariableModelKey;
}


export class VariableModelFactory implements IBaseVariableModel {
    _meta: IBaseVariableModel['_meta'];

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

        this._meta = this.#model._meta;
        Object.getOwnPropertyNames(this.#model).forEach((property) => {
            if (property.startsWith('_')) return;
            Object.defineProperty(this, property, {
                get: () => this.#model[property],
            });
        });
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        return this.#model.list(query);
    }

    generateProperty<T=any>(options: PropertyOptions<T>): PropertyObject<T> {
        if (!this.#model.generateProperty) throw new Error('generateProperty method is not implemented');
        return this.#model.generateProperty(options);
    }
}
