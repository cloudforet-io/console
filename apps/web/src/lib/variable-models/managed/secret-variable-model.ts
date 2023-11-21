import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';


export default class SecretVariableModel extends ResourceNameVariableModel {
    key = 'secret';

    name = 'Secret';

    labels: VariableModelLabel[] = [];

    resourceType = 'secret.Secret';

    idKey = 'secret_id';
}
