import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { ProjectType } from '@/schema/identity/project/type';
import type { AlertState } from '@/schema/monitoring/alert/model';

import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


export interface AlertCount {
    state: AlertState;
    total: number;
}

export const useProjectDetailPageStore = defineStore('project-detail-page', () => {
    const state = reactive({
        loading: false,
        projectId: undefined as string | undefined,
        currentProject: null as ProjectModel | null,
        alertCounts: [] as AlertCount[],
    });
    const getters = reactive({
        projectType: computed<ProjectType|undefined>(() => state.currentProject?.project_type),
    });

    /* mutations */
    const setProjectId = (projectId?: string) => {
        state.projectId = projectId;
    };
    const setProject = (project: ProjectModel|null) => {
        state.currentProject = project;
    };

    /* actions */
    const getProject = async (projectId?: string) => {
        try {
            state.loading = true;
            const _projectId = projectId || state.projectId;
            if (!_projectId) throw new Error('projectId is required');
            state.currentProject = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
                project_id: _projectId,
            });
        } catch (e) {
            state.currentProject = null;
            ErrorHandler.handleError(new NoResourceError({ name: PROJECT_ROUTE._NAME }));
        } finally {
            state.loading = false;
        }
    };
    const getAlertCounts = async (projectId?: string) => {
        try {
            const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
                project_id: projectId || state.projectId,
            });
            state.alertCounts = results;
        } catch (e) {
            state.alertCounts = [];
            console.error(e);
        }
    };
    const reset = () => {
        state.projectId = '';
        state.currentProject = null;
        state.alertCounts = [];
    };

    const mutations = {
        setProjectId,
        setProject,
    };
    const actions = {
        getProject,
        getAlertCounts,
        reset,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
