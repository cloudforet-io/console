import type { SecretModel } from '@/schema/secret/secret/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class SecretVariableModel extends ResourceVariableModel<SecretModel> {
    key = 'secret';

    name = 'Secret';

    resourceType = 'secret.Secret';

    idKey = 'secret_id';

    // properties
    provider = this.property({ key: 'provider', name: 'Provider' });
}
