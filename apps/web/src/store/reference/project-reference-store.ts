import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface ProjectResourceItemData {
    groupInfo?: {
        id: string;
        name: string;
    };
    users: string[];
}
export type ProjectReferenceItem = Required<Pick<ReferenceItem<ProjectResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;


const _listProjectGroup = async (projectGroupIdList: string[]): Promise<ProjectGroupModel[]> => {
    try {
        const res = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>({
            query: {
                only: ['project_group_id', 'name'],
                filter: [
                    {
                        k: 'project_group_id',
                        v: projectGroupIdList,
                        o: 'in',
                    },
                ],
            },
        });
        return res?.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
export const useProjectReferenceStore = defineStore('project-reference', () => {
    const _state = reactive({
        projectGroupList: [] as ProjectGroupModel[],
    });
    const state = reactive({
        items: null as ProjectReferenceMap | null,
    });

    const getters = reactive({
        projectItems: asyncComputed<ProjectReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        projectTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.project._meta.key,
            key: MANAGED_VARIABLE_MODELS.project._meta.idKey,
            name: MANAGED_VARIABLE_MODELS.project._meta.name,
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
                only: ['project_id', 'name', 'project_group_id', 'users'],
            },
        };
        const res = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>(params);

        const projectGroupIdList = res.results?.map((d) => d.project_group_id) ?? [];
        _state.projectGroupList = await _listProjectGroup(projectGroupIdList);
        const projectReferenceMap: ProjectReferenceMap = {};

        // eslint-disable-next-line no-restricted-syntax
        res?.results?.forEach((projectInfo) => {
            const projectGroup = _state.projectGroupList.find((d) => d.project_group_id === projectInfo.project_group_id);
            projectReferenceMap[projectInfo.project_id] = {
                key: projectInfo.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${projectInfo.name}` : projectInfo.name,
                name: projectInfo.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.project_group_id,
                        name: projectGroup.name,
                    } : undefined,
                    users: projectInfo.users || [],
                },
            };
        });

        state.items = projectReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (project: ProjectModel) => {
        const projectGroup = _state.projectGroupList.find((d) => d.project_group_id === project.project_group_id);
        state.items = {
            ...state.items,
            [project.project_id]: {
                key: project.project_id,
                label: (projectGroup)
                    ? `${projectGroup.name} > ${project.name}` : project.name,
                name: project.name,
                data: {
                    groupInfo: (projectGroup) ? {
                        id: projectGroup.project_group_id,
                        name: projectGroup.name,
                    } : undefined,
                    users: project.users || [],
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

