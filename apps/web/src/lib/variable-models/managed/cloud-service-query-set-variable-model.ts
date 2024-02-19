import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class CloudServiceQuerySetVariableModel extends ResourceNameVariableModel {
    key = 'cloud_service_query_set';

    name = 'Compliance Framework';

    resourceType = 'inventory.CloudServiceQuerySet';

    idKey = 'query_set_id';
}
