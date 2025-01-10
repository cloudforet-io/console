import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';

export default class RoleBindingVariableModel extends ResourceVariableModel {
    static meta = {
        key: 'role_binding',
        name: 'Role Binding',
        resourceType: 'identity.RoleBinding',
        idKey: 'role_binding_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = RoleBindingVariableModel.meta;
    }
}
