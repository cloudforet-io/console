import type { ProviderModel } from '@/schema/identity/provider/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class ProviderVariableModel extends ResourceVariableModel<ProviderModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'provider',
        name: 'Provider',
        resourceType: 'identity.Provider',
        idKey: 'provider_id',
        nameKey: 'name',
    };

    get properties() {
        return [this.provider.key];
    }
}
