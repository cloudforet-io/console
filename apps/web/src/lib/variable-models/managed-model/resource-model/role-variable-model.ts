import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class RoleVariableModel extends ResourceVariableModel<RoleModel> {
    static meta = {
        key: 'role',
        name: 'Role',
        resourceType: 'identity.Role',
        idKey: 'role_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = RoleVariableModel.meta;
    }
}
