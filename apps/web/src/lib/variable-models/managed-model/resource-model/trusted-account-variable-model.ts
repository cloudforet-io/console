import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class TrustedAccountVariableModel extends ResourceVariableModel<TrustedAccountModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'trusted_account',
        name: 'Trusted Account',
        resourceType: 'identity.TrustedAccount',
        idKey: 'trusted_account_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = TrustedAccountVariableModel.meta;
    }
}
