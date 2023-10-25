import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class ServiceAccountVariableModel extends ResourceNameVariableModel {
    key = 'service_account';

    name = 'Service Account';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'identity.ServiceAccount';

    idKey = 'service_account_id';
}
