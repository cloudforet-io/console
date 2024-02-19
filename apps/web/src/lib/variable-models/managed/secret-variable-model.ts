import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class SecretVariableModel extends ResourceVariableModel {
    key = 'secret';

    name = 'Secret';

    resourceType = 'secret.Secret';

    idKey = 'secret_id';
}
