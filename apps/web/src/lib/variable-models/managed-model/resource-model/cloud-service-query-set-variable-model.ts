import type { CloudServiceQuerySetModel } from '@/schema/inventory/cloud-service-query-set/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class CloudServiceQuerySetVariableModel extends ResourceVariableModel<CloudServiceQuerySetModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    cloud_service_group = this.generateProperty({ key: 'cloud_service_group', name: 'Cloud Service Group' });

    static meta = {
        key: 'cloud_service_query_set',
        name: 'Compliance Framework',
        resourceType: 'inventory.CloudServiceQuerySet',
        idKey: 'query_set_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = CloudServiceQuerySetVariableModel.meta;
    }
}
