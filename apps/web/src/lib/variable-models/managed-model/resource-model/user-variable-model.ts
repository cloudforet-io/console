import type { UserModel } from '@/schema/identity/user/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class UserVariableModel extends ResourceVariableModel<UserModel> {
    meta = {
        key: 'user',
        name: 'User',
        resourceType: 'identity.User',
        idKey: 'user_id',
        nameKey: 'name',
    };

    nameFormatter(): string {
        return this.meta.nameKey || this.meta.idKey;
    }
}
