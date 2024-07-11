import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { ProjectType } from '@/schema/identity/project/type';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

// eslint-disable-next-line import/no-cycle
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';



interface ProjectResourceItemData {
    groupInfo?: {
        id: string;
        name: string;
    };
    users: string[];
    projectType: ProjectType;
}
export type ProjectReferenceItem = Required<Pick<ReferenceItem<ProjectResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useProjectReferenceStore = defineStore('reference-project', () => {
    const allReferenceStore = useAllReferenceStore();
    const state = reactive({
        items: null as ProjectReferenceMap | null,
    });

    const _getters = reactive({
        projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    });

    const getters = reactive({
        projectItems: asyncComputed<ProjectReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        projectTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.project.meta.key,
            key: MANAGED_VARIABLE_MODELS.project.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.project.meta.name,
            referenceMap: getters.projectItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: ProjectListParameters = {
            query: {
                only: ['project_id', 'name', 'project_group_id', 'users', 'project_type'],
            },
        };
        const res = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>(params);

        const projectReferenceMap: ProjectReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        res?.results?.forEach((projectInfo) => {
            const projectGroup = Object.values(_getters.projectGroup ?? {}).find((d) => d.key === projectInfo.project_group_id);
            projectReferenceMap[projectInfo.project_id] = {
                key: projectInfo.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${projectInfo.name}` : projectInfo.name,
                name: projectInfo.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.key,
                        name: projectGroup.name,
                    } : undefined,
                    users: projectInfo.users || [],
                    projectType: projectInfo.project_type,
                },
            };
        });

        state.items = projectReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (project: ProjectModel) => {
        const projectGroup = Object.values(_getters.projectGroup ?? {}).find((d) => d.key === project.project_group_id);
        state.items = {
            ...state.items,
            [project.project_id]: {
                key: project.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${project.name}` : project.name,
                name: project.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.key,
                        name: projectGroup.name,
                    } : undefined,
                    users: project.users || [],
                    projectType: project.project_type,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

