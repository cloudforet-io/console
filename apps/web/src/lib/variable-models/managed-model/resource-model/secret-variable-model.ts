import type { SecretModel } from '@/schema/secret/secret/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class SecretVariableModel extends ResourceVariableModel<SecretModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'secret',
        name: 'Secret',
        resourceType: 'secret.Secret',
        idKey: 'secret_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = SecretVariableModel.meta;
    }
}
