import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class CollectorVariableModel extends ResourceVariableModel {
    key = 'collector';

    name = 'Collector';

    resourceType = 'inventory.Collector';

    idKey = 'collector_id';
}
