import type { SecretModel } from '@/schema/secret/secret/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class SecretVariableModel extends ResourceVariableModel<SecretModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static _meta = {
        key: 'secret',
        name: 'Secret',
        resourceType: 'secret.Secret',
        idKey: 'secret_id',
        nameKey: 'name',
    };

    constructor() {
        super();
        this._meta = SecretVariableModel._meta;
    }
}
