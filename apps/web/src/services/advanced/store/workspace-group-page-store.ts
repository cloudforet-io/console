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

import type { WorkspaceGroupModalType } from '@/services/advanced/types/admin-workspace-group-type';


interface ModalAdditionalData {
    workspaceGroupId?: string;
    selectedWorkspace?: WorkspaceModel;
    selectedGroupUser?: WorkspaceGroupUser;
    isOpenByWorkspaceGroupCreateModal?: boolean;
    isOpenByWorkspaceGroupUsersTab?: boolean;
}

interface WorkspaceGroupPageState {
    loading: boolean;
    selectedIndices: number[];
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
    modalAdditionalData: ModalAdditionalData;
}

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive<WorkspaceGroupPageState>({
        loading: false,
        selectedIndices: [],
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

    const userTabState = reactive<{
        selectedUserIndices: number[];
        selectedUser: WorkspaceGroupUser[];
    }>({
        selectedUserIndices: [],
        selectedUser: [],
    });

    const workspaceTabState = reactive<{
        selectedIndices: number[];
        selectedWorkspaces: WorkspaceModel[];
        costReportConfig: CostReportConfigModel|null|undefined;
    }>({
        selectedIndices: [],
        selectedWorkspaces: [],
        costReportConfig: null,
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = reactive({
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
            additionalData?: ModalAdditionalData;
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
            userTabState.selectedUserIndices = [];
            userTabState.selectedUser = [];
        },
        reset: () => {
            state.loading = false;
            state.selectedWorkspaceGroup = null;
            state.selectedIndices = [];

            actions.resetGroupUser();
            actions.closeModal();
        },
        resetSelectedWorkspace: () => {
            workspaceTabState.selectedWorkspaces = [];
            workspaceTabState.selectedIndices = [];
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
