import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CloudServiceVariableModel extends ResourceVariableModel<CloudServiceModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    account = this.generateProperty({ key: 'account', name: 'Asset Account' });

    static meta = {
        key: 'cloud_service',
        name: 'Cloud Service',
        resourceType: 'inventory.CloudService',
        idKey: 'cloud_service_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CloudServiceVariableModel.meta;
    }
}
