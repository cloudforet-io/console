import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGroupAddUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/add-users';
import type { ProjectGroupChangeParentGroupParameters } from '@/api-clients/identity/project-group/schema/api-verbs/change-parent-group';
import type { ProjectGroupCreateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/create';
import type { ProjectGroupDeleteParameters } from '@/api-clients/identity/project-group/schema/api-verbs/delete';
import type { ProjectGroupGetParameters } from '@/api-clients/identity/project-group/schema/api-verbs/get';
import type { ProjectGroupListParameters } from '@/api-clients/identity/project-group/schema/api-verbs/list';
import type { ProjectGroupRemoveUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/remove-users';
import type { ProjectGroupUpdateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/update';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';


export const useProjectGroupApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.projectGroup.create<ProjectGroupCreateParameters, ProjectGroupModel>,
        update: SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters, ProjectGroupModel>,
        delete: SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>,
        get: SpaceConnector.clientV2.identity.projectGroup.get<ProjectGroupGetParameters, ProjectGroupModel>,
        list: SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>,
        addUsers: SpaceConnector.clientV2.identity.projectGroup.addUsers<ProjectGroupAddUsersParameters, ProjectGroupModel>,
        removeUsers: SpaceConnector.clientV2.identity.projectGroup.removeUsers<ProjectGroupRemoveUsersParameters, ProjectGroupModel>,
        changeParentGroup: SpaceConnector.clientV2.identity.projectGroup.changeParentGroup<ProjectGroupChangeParentGroupParameters, ProjectGroupModel>,
    };

    return {
        projectGroupAPI: actions,
    };
};
