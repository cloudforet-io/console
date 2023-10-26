import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CloudServiceQuerySetVariableModel extends ResourceNameVariableModel {
    key = 'cloud_service_query_set';

    name = 'Cloud Service Query Set';

    labels: VariableModelLabel[] = [];

    resourceType = 'inventory.CloudServiceQuerySet';

    idKey = 'query_set_id';
}
