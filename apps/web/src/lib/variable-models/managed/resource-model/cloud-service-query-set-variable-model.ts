import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class CloudServiceQuerySetVariableModel extends ResourceVariableModel {
    key = 'cloud_service_query_set';

    name = 'Compliance Framework';

    resourceType = 'inventory.CloudServiceQuerySet';

    idKey = 'query_set_id';
}
