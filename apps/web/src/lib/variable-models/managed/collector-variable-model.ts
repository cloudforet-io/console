import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class CollectorVariableModel extends ResourceNameVariableModel {
    key = 'collector';

    name = 'Collector';

    resourceType = 'inventory.Collector';

    idKey = 'collector_id';
}
