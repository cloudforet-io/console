import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleCreateParameters } from '@/api-clients/identity/role/schema/api-verbs/create';
import type { RoleDeleteParameters } from '@/api-clients/identity/role/schema/api-verbs/delete';
import type { RoleDisableParameters } from '@/api-clients/identity/role/schema/api-verbs/disable';
import type { RoleEnableParameters } from '@/api-clients/identity/role/schema/api-verbs/enable';
import type { RoleGetParameters } from '@/api-clients/identity/role/schema/api-verbs/get';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleListBasicRoleParameters } from '@/api-clients/identity/role/schema/api-verbs/list-basic-role';
import type { RoleUpdateParameters } from '@/api-clients/identity/role/schema/api-verbs/update';
import type { BasicRoleModel, RoleModel } from '@/api-clients/identity/role/schema/model';

export const useRoleApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.role.create<RoleCreateParameters, RoleModel>,
        update: SpaceConnector.clientV2.identity.role.update<RoleUpdateParameters, RoleModel>,
        delete: SpaceConnector.clientV2.identity.role.delete<RoleDeleteParameters>,
        get: SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>,
        list: SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>,
        enable: SpaceConnector.clientV2.identity.role.enable<RoleEnableParameters, RoleModel>,
        disable: SpaceConnector.clientV2.identity.role.disable<RoleDisableParameters, RoleModel>,
        listBasicRole: SpaceConnector.clientV2.identity.role.listBasicRole<RoleListBasicRoleParameters, ListResponse<BasicRoleModel>>,
    };

    return {
        roleAPI: actions,
    };
};
