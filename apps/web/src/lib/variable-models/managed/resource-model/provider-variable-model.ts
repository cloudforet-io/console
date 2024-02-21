import type { ProviderModel } from '@/schema/identity/provider/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class ProviderVariableModel extends ResourceVariableModel<ProviderModel> {
    key = 'provider';

    name = 'Provider';

    resourceType = 'identity.Provider';

    idKey = 'provider';

    // properties
    provider = this.property({ key: 'provider', name: 'Provider' });
}
