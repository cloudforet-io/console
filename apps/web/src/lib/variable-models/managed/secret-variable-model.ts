import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class SecretVariableModel extends ResourceNameVariableModel {
    key = 'secret';

    name = 'Secret';

    resourceType = 'secret.Secret';

    idKey = 'secret_id';
}
