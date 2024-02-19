import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class UserVariableModel extends ResourceNameVariableModel {
    key = 'user';

    name = 'User';

    resourceType = 'identity.User';

    idKey = 'user_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
