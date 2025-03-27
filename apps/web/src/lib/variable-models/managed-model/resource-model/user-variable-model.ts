import type { UserModel } from '@/api-clients/identity/user/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class UserVariableModel extends ResourceVariableModel<UserModel> {
    static meta = {
        key: 'user',
        name: 'User',
        resourceType: 'identity.User',
        idKey: 'user_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = UserVariableModel.meta;
    }

    nameFormatter(): string {
        return this._meta.nameKey || this._meta.idKey;
    }
}
