import type { CloudServiceQuerySetModel } from '@/schema/inventory/cloud-service-query-set/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class CloudServiceQuerySetVariableModel extends ResourceVariableModel<CloudServiceQuerySetModel> {
    provider = this.generateProperty({ key: 'provider', name: 'Provider' });

    meta = {
        key: 'cloud_service_query_set',
        name: 'Compliance Framework',
        resourceType: 'inventory.CloudServiceQuerySet',
        idKey: 'query_set_id',
        nameKey: 'name',
        _properties: [this.provider.key],
    };
}
