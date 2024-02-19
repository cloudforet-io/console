import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class ServiceAccountVariableModel extends ResourceNameVariableModel {
    key = 'service_account';

    name = 'Service Account';

    resourceType = 'identity.ServiceAccount';

    idKey = 'service_account_id';
}
