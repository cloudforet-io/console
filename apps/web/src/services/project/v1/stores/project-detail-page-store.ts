import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import type { AlertState } from '@/schema/monitoring/alert/type';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';

import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

export interface AlertCount {
    state: AlertState;
    total: number;
}

interface ProjectDetailPageState {
    loading: boolean,
    projectId?: string,
    currentProject?: ProjectModel,
    alertCounts: AlertCount[],
    webhookList?: WebhookModel[],
    selectedWebhookItemIdx: number[],
}
export const useProjectDetailPageStore = defineStore('page-project-detail', () => {
    const state = reactive<ProjectDetailPageState>({
        loading: false,
        projectId: undefined,
        currentProject: undefined,
        alertCounts: [],
        webhookList: undefined,
        selectedWebhookItemIdx: [],
    });
    const getters = reactive({
        projectType: computed<ProjectType|undefined>(() => state.currentProject?.project_type),
        selectedWebhookItem: computed<WebhookModel|undefined>(() => {
            if (state.selectedWebhookItemIdx.length === 0) return undefined;
            const idx = state.selectedWebhookItemIdx[0];
            return state.webhookList?.[idx];
        }),
    });

    /* mutations */
    const setProjectId = (projectId?: string) => {
        state.projectId = projectId;
    };
    const setProject = (project: ProjectModel|undefined) => {
        state.currentProject = project;
    };
    const setWebhookList = (webhookList: WebhookModel[]|undefined) => {
        state.webhookList = webhookList;
    };
    const setWebhookItemIdx = (idx: number[]) => {
        state.selectedWebhookItemIdx = idx;
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
            state.currentProject = undefined;
            ErrorHandler.handleError(new NoResourceError({ name: PROJECT_ROUTE_V1._NAME }));
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

    const getRepositoryID = async () => {
        const res = await SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>({
            repository_type: 'remote',
        });
        return res.results ? res.results[0].repository_id : '';
    };
    const getListWebhookType = async () => {
        try {
            const repositoryId = await getRepositoryID();
            const { results } = await SpaceConnector.clientV2.repository.plugin.list<PluginListParameters, ListResponse<PluginModel>>({
                repository_id: repositoryId,
                resource_type: 'monitoring.Webhook',
            });
            return results ?? [];
        } catch (e) {
            ErrorHandler.handleError(e);
            return [];
        }
    };

    const reset = () => {
        state.projectId = '';
        state.currentProject = undefined;
        state.alertCounts = [];
    };

    const mutations = {
        setProjectId,
        setProject,
        setWebhookList,
        setWebhookItemIdx,
    };
    const actions = {
        getProject,
        getAlertCounts,
        reset,
        getListWebhookType,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
