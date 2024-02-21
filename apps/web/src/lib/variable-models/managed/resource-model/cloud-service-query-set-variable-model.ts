import type { CloudServiceQuerySetModel } from '@/schema/inventory/cloud-service-query-set/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import { ListQuery } from '@/lib/variable-models/_base/types';
import { query } from 'vue-gtag';


export default class CloudServiceQuerySetVariableModel extends ResourceVariableModel<CloudServiceQuerySetModel> {
    key = 'cloud_service_query_set';

    name = 'Compliance Framework';

    resourceType = 'inventory.CloudServiceQuerySet';

    idKey = 'query_set_id';

    // properties
    provider = this.property({ key: 'provider', name: 'Provider' });

    protected _getParams(query: ListQuery = {}): Record<string, any> {
        return super._getParams(query);
    }
}
