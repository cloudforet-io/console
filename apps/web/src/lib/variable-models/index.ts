import EnumVariableModel from '@/lib/variable-models/_base/enum-variable-model';
import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { IBaseVariableModel, IEnumVariableModel, IResourceVariableModel } from '@/lib/variable-models/_base/types';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { MANAGED_VARIABLE_MODEL_KEY_MAP, MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

// config
export interface GenerationConfig {
    type: 'MANAGED';
    key?: ManagedVariableModelKey;
    name?: string;
}

interface GenerateVariableModelOptions {
    key: string;
    type: 'ENUM'|'RESOURCE';
}

type GeneratedVariableModel = (new (config, option) => IBaseVariableModel|IResourceVariableModel|IEnumVariableModel)|undefined;
export const generateVariableModel = ({ key, type }: GenerateVariableModelOptions): GeneratedVariableModel => {
    const isMangedModel = !!MANAGED_VARIABLE_MODEL_KEY_MAP[key];
    if (isMangedModel) return MANAGED_VARIABLE_MODELS[key];
    // all resource models are managed models
    if (type === 'RESOURCE') return ResourceVariableModel;
    if (type === 'ENUM') return EnumVariableModel;
    return undefined;
};

// export class VariableModel implements IBaseVariableModel {
//     key: string;
//
//     name: string;
//
//     #model: IBaseVariableModel;
//
//     #type: VariableModelConfigType;
//
//     constructor(type: 'RESOURCE'|'ENUM', config, additionalOptions?: VariableInitialOptoins) {
//         const isManagedModel = !!MANAGED_VARIABLE_MODEL_KEY_MAP[config.key];
//         const _additionalOptions = type === 'RESOURCE' ? additionalOptions : undefined;
//         if (isManagedModel) {
//             const Model = MANAGED_VARIABLE_MODELS[config.key];
//             this.#model = new Model(config, _additionalOptions);
//             // {}
//             /*
//             * {
//             * }
//             * */
//         } else if (type === 'ENUM') {
//             this.#model = new EnumVariableModel(config);
//         }
//
//         //
//         // if (type === 'MANAGED') {
//         //     if (!config.key) throw new Error('key is required');
//         //     const Model = MANAGED_VARIABLE_MODELS[config.key];
//         //     let _config = {};
//         //     if (Model.type === 'RESOURCE') _config = resourceOptoins;
//         //     else if (Model.type === 'ENUM') _config = enumOptions;
//         //
//         //     this.#model = new Model();
//         // } else if (type === 'RESOURCE') {
//         //     this.#model = new ResourceVariableModel(config);
//         // } else if (type === 'ENUM') {
//         //     this.#model = new EnumVariableModel(config);
//         // } else {
//         //     throw new Error(`Invalid config type for VariableModel: ${(config as any).type}`);
//         // }
//
//         this.key = this.#model.key;
//         this.name = config.name ?? (this.#model.name || this.#model.key);
//         this.#type = type;
//     }
//
//     get type() {
//         return this.#type;
//     }
//
//     async list(query: ListQuery = {}): Promise<ListResponse> {
//         return this.#model.list(query);
//     }
// }

