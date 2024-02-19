import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class ServiceAccountVariableModel extends ResourceVariableModel {
    key = 'service_account';

    name = 'Service Account';

    resourceType = 'identity.ServiceAccount';

    idKey = 'service_account_id';
}
