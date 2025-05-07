import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectAddUsersParameters } from '@/api-clients/identity/project/schema/api-verbs/add-users';
import type { ProjectChangeProjectGroupParameters } from '@/api-clients/identity/project/schema/api-verbs/change-project-group';
import type { ProjectCreateParameters } from '@/api-clients/identity/project/schema/api-verbs/create';
import type { ProjectDeleteParameters } from '@/api-clients/identity/project/schema/api-verbs/delete';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectListParameters } from '@/api-clients/identity/project/schema/api-verbs/list';
import type { ProjectRemoveUsersParameters } from '@/api-clients/identity/project/schema/api-verbs/remove-users';
import type { ProjectUpdateParameters } from '@/api-clients/identity/project/schema/api-verbs/udpate';
import type { ProjectUpdateProjectTypeParameters } from '@/api-clients/identity/project/schema/api-verbs/update-project-type';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';


export const useProjectApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.project.create<ProjectCreateParameters, ProjectModel>,
        update: SpaceConnector.clientV2.identity.project.update<ProjectUpdateParameters, ProjectModel>,
        delete: SpaceConnector.clientV2.identity.project.delete<ProjectDeleteParameters>,
        get: SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>,
        list: SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>,
        addUsers: SpaceConnector.clientV2.identity.project.addUsers<ProjectAddUsersParameters, ProjectModel>,
        removeUsers: SpaceConnector.clientV2.identity.project.removeUsers<ProjectRemoveUsersParameters, ProjectModel>,
        changeProjectGroup: SpaceConnector.clientV2.identity.project.changeProjectGroup<ProjectChangeProjectGroupParameters, ProjectModel>,
        updateProjectType: SpaceConnector.clientV2.identity.project.updateProjectType<ProjectUpdateProjectTypeParameters, ProjectModel>,
    };

    return {
        projectAPI: actions,
    };
};
