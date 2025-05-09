import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleCreateParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/create';
import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';

export const useRoleBindingApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>,
        delete: SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>,
        list: SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>,
        updateRole: SpaceConnector.clientV2.identity.roleBinding.updateRole<RoleBindingUpdateRoleParameters, RoleBindingModel>,
    };

    return {
        roleBindingAPI: actions,
    };
};
