import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class CollectorVariableModel extends ResourceNameVariableModel {
    key = 'collector';

    name = 'Collector';

    labels: VariableModelLabel[] = [];

    resourceType = 'inventory.Collector';

    idKey = 'collector_id';
}
