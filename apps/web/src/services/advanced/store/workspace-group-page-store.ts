import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ModalThemeColor } from '@cloudforet/mirinae/types/feedbacks/modals/button-modal/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import type { Currency } from '@/store/display/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { WorkspaceGroupModalType } from '../types/admin-workspace-group-type';

interface WorkspaceGroupPageState {
    loading: boolean;
    selectedIndices: number[];
    totalCount: number;
    searchFilters: ConsoleFilter[];
    selectedWorkspaceGroup: WorkspaceGroupModel | null;

    // Group User Tab,
    roles: RoleModel[];

    modal: {
        type: WorkspaceGroupModalType | '';
        title: string | TranslateResult;
        themeColor?: ModalThemeColor;
        visible: WorkspaceGroupModalType | '';
    };
    modalAdditionalData: { workspaceGroupId?: string, selectedWorkspace?: WorkspaceModel, selectedGroupUser?: WorkspaceGroupUser };
}

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive<WorkspaceGroupPageState>({
        loading: false,
        selectedIndices: [],
        totalCount: 0,
        searchFilters: [],
        selectedWorkspaceGroup: null,
        // Group User Tab,
        roles: [],

        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
        // Additional data added for data transfer between modals
        modalAdditionalData: {},
    });

    const userTabState = reactive({
        selectedUserIndices: [],
        userInSelectedGroup: [],
        userInSelectedGroupTotalCount: 0,
        searchText: '',
        thisPage: 1,
        sortBy: 'name',
        sortDesc: false,
        pageStart: 1,
        pageLimit: 15,
        loading: false,
    });

    const workspaceTabState = reactive({
        selectedWorkspaceIndices: [],
        workspacesInSelectedGroup: [],
        workspacesInSelectedGroupTotalCount: 0,
        searchText: '',
        thisPage: 1,
        sortBy: 'name',
        sortDesc: false,
        pageStart: 1,
        pageLimit: 15,
        loading: false,
        costReportConfig: null as CostReportConfigModel|null|undefined,
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = reactive({
        groupUserPage: computed(() => userTabState.pageStart / userTabState.pageLimit),
        selectedWorkspaceIds: computed<string[]>(() => workspaceTabState.selectedWorkspaceIndices.map((index: number) => workspaceTabState.workspacesInSelectedGroup[index].workspace_id)),
        selectedGroupUsersByIndices: computed<WorkspaceGroupUser[]>(() => userTabState.selectedUserIndices.map((index: number) => userTabState.userInSelectedGroup[index])),
        currency: computed<Currency|undefined>(() => workspaceTabState.costReportConfig?.currency),
    });

    const actions = {
        updateModalSettings: ({
            type, title, themeColor = 'primary', visible, additionalData = {},
        }: {
            type: WorkspaceGroupModalType;
            title: string | TranslateResult;
            themeColor?: ModalThemeColor;
            visible: WorkspaceGroupModalType | '';
            additionalData?: { workspaceGroupId?: string, selectedWorkspace?: WorkspaceModel, selectedGroupUser?: WorkspaceGroupUser };
        }) => {
            state.modal = {
                type,
                title,
                themeColor,
                visible,
            };
            state.modalAdditionalData = additionalData;
        },
        closeModal: () => {
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
            state.modalAdditionalData = {};
        },
        resetGroupUser: () => {
            userTabState.thisPage = 1;
            userTabState.searchText = '';
            userTabState.sortBy = 'user_id';
            userTabState.sortDesc = false;
            userTabState.selectedUserIndices = [];
            userTabState.pageStart = 1;
            userTabState.pageLimit = 15;
        },
        resetWorkspaceTab: () => {
            workspaceTabState.searchText = '';
            workspaceTabState.thisPage = 1;
            workspaceTabState.sortBy = 'name';
            workspaceTabState.sortDesc = true;
            workspaceTabState.pageStart = 1;
            workspaceTabState.pageLimit = 15;
            workspaceTabState.selectedWorkspaceIndices = [];
        },
        reset: () => {
            state.loading = false;
            state.selectedWorkspaceGroup = null;
            state.selectedIndices = [];
            state.totalCount = 0;

            actions.resetGroupUser();
            actions.resetWorkspaceTab();
            actions.closeModal();
        },
        resetSelectedWorkspace: () => {
            workspaceTabState.selectedWorkspaceIndices = [];
        },
        listRoles: async () => {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    query: {
                        filter: [
                            { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                        ],
                    },
                });
                state.roles = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.roles = [];
            }
        },
        // listWorkspacesInSelectedGroup: async () => {
        //     workspaceTabState.loading = true;
        //     try {
        //         const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
        //             query: getWorkspacesInSelectedGroupApiQuery(),
        //         });
        //         workspaceTabState.workspacesInSelectedGroup = results || [];
        //         workspaceTabState.workspacesInSelectedGroupTotalCount = total_count || 0;
        //     } catch (e) {
        //         ErrorHandler.handleError(e);
        //         workspaceTabState.workspacesInSelectedGroup = [];
        //         workspaceTabState.workspacesInSelectedGroupTotalCount = 0;
        //     } finally {
        //         workspaceTabState.loading = false;
        //     }
        // },
        fetchCostReportConfig: async () => {
            if (workspaceTabState.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>({
                    query: {
                        sort: [{ key: 'created_at', desc: false }],
                    },
                });
                workspaceTabState.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                workspaceTabState.costReportConfig = undefined;
            }
        },
    };

    return {
        state,
        userTabState,
        workspaceTabState,
        getters,
        ...actions,
    };
});
