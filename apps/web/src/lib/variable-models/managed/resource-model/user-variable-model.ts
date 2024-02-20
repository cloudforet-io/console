import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class UserVariableModel extends ResourceVariableModel {
    key = 'user';

    name = 'User';

    resourceType = 'identity.User';

    idKey = 'user_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
