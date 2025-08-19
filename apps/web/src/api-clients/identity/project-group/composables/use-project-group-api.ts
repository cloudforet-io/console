import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import type { ProjectGroupAddUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/add-users';
import type { ProjectGroupChangeParentGroupParameters } from '@/api-clients/identity/project-group/schema/api-verbs/change-parent-group';
import type { ProjectGroupCreateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/create';
import type { ProjectGroupDeleteParameters } from '@/api-clients/identity/project-group/schema/api-verbs/delete';
import type { ProjectGroupGetParameters } from '@/api-clients/identity/project-group/schema/api-verbs/get';
import type { ProjectGroupListParameters } from '@/api-clients/identity/project-group/schema/api-verbs/list';
import type { ProjectGroupRemoveUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/remove-users';
import type { ProjectGroupStatParameters } from '@/api-clients/identity/project-group/schema/api-verbs/stat';
import type { ProjectGroupUpdateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/update';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';


export const useProjectGroupApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('projectGroup');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.create<ProjectGroupCreateParameters, ProjectGroupModel>),
        update: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters, ProjectGroupModel>),
        delete: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>),
        get: SpaceConnector.clientV2.identity.projectGroup.get<ProjectGroupGetParameters, ProjectGroupModel>,
        list: SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>,
        addUsers: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.addUsers<ProjectGroupAddUsersParameters, ProjectGroupModel>),
        removeUsers: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.removeUsers<ProjectGroupRemoveUsersParameters, ProjectGroupModel>),
        changeParentGroup: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.projectGroup.changeParentGroup<ProjectGroupChangeParentGroupParameters, ProjectGroupModel>),
        stat: SpaceConnector.clientV2.identity.projectGroup.stat<ProjectGroupStatParameters, StatResponse>,
    };

    return {
        projectGroupAPI: actions,
    };
};
