/* eslint-disable import/no-cycle */
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ReferenceLoadOptions } from '@/store/modules/reference/type';
import type { CloudServiceQuerySetReferenceMap } from '@/store/reference/cloue-service-query-set-reference-store';
import {
    useCloudServiceQuerySetReferenceStore,
} from '@/store/reference/cloue-service-query-set-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import type { ManagedVariableModelKey } from '@/lib/variable-models/managed';

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const userReferenceStore = useUserReferenceStore();

    const getters = reactive({
        projectGroup: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
        project: computed<ProjectReferenceMap>(() => projectReferenceStore.getters.projectItems),
        user: computed<UserReferenceMap>(() => userReferenceStore.getters.userItems),
        costDataSource: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
        cloudServiceQuerySet: computed<CloudServiceQuerySetReferenceMap>(() => cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetItems),
        workspace: computed<WorkspaceReferenceMap>(() => workspaceReferenceStore.getters.workspaceItems),
    });

    const actions = {
        async sync(type: ManagedVariableModelKey, data?: any) {
            if (type === 'project') {
                await projectReferenceStore.sync(data);
            } else if (type === 'project_group') {
                await projectGroupReferenceStore.sync(data);
            } else if (type === 'workspace') {
                await workspaceReferenceStore.sync(data);
            } else if (type === 'user') {
                await userReferenceStore.sync(data);
            }
        },
        async load(type: ManagedVariableModelKey, options?: ReferenceLoadOptions) {
            if (type === 'cost_data_source') {
                await costDataSourceReferenceStore.load(options);
            } else if (type === 'cloud_service_query_set') {
                await cloudServiceQuerySetReferenceStore.load(options);
            } else if (type === 'project') {
                await projectReferenceStore.load(options);
            } else if (type === 'project_group') {
                await projectGroupReferenceStore.load(options);
            } else if (type === 'workspace') {
                await workspaceReferenceStore.load(options);
            } else if (type === 'user') {
                await userReferenceStore.load(options);
            }
        },
        flush() {
            costDataSourceReferenceStore.flush();
            cloudServiceQuerySetReferenceStore.flush();
            projectReferenceStore.flush();
            projectGroupReferenceStore.flush();
            workspaceReferenceStore.flush();
            userReferenceStore.flush();
        },
    };

    return {
        getters,
        ...actions,
    };
});
