import type { ServiceAccountModel } from '@/schema/identity/service-account/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class ServiceAccountVariableModel extends ResourceVariableModel<ServiceAccountModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    static meta = {
        key: 'service_account',
        name: 'Service Account',
        resourceType: 'identity.ServiceAccount',
        idKey: 'service_account_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ServiceAccountVariableModel.meta;
    }
}
