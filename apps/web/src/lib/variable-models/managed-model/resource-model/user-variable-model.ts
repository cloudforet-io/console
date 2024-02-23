import type { UserModel } from '@/schema/identity/user/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';


export default class UserVariableModel extends ResourceVariableModel<UserModel> {
    static _meta = {
        key: 'user',
        name: 'User',
        resourceType: 'identity.User',
        idKey: 'user_id',
        nameKey: 'name',
    };

    nameFormatter(): string {
        return this._meta.nameKey || this._meta.idKey;
    }
}
