import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class UserGroupVariableModel extends ResourceVariableModel<UserGroupModel> {
    static meta = {
        key: 'user_group',
        name: 'User Group',
        resourceType: 'identity.UserGroup',
        idKey: 'user_group_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = UserGroupVariableModel.meta;
    }
}
