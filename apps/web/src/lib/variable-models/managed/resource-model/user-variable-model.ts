import type { UserModel } from '@/schema/identity/user/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class UserVariableModel extends ResourceVariableModel<UserModel> {
    key = 'user';

    name = 'User';

    resourceType = 'identity.User';

    idKey = 'user_id';

    nameFormatter(): string {
        return this.nameKey || this.idKey;
    }
}
