import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class ProviderVariableModel extends ResourceVariableModel<ProviderModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'provider',
        name: 'Provider',
        resourceType: 'identity.Provider',
        idKey: 'provider',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ProviderVariableModel.meta;
    }
}
