import { reactive } from 'vue';
import type { UnwrapRef } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { AlertAssignUserParameters } from '@/schema/monitoring/alert/api-verbs/assign-user';
import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModel } from '@/schema/monitoring/alert/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface State {
    userIds: string[];
    totalUserCount: number;
    loading: boolean;
}
export const useAlertAssignUserStore = defineStore('alert-user-assign-store', () => {
    const state = reactive({
        userIds: [] as string[],
        totalUserCount: 0,
        loading: false,
    }) as UnwrapRef<State>;

    const actions = {
        async updateToAcknowledgeAndAssignUser(alertId: string, userId?: string) {
            try {
                await SpaceConnector.clientV2.monitoring.alert.update<AlertUpdateParameters>({
                    alert_id: alertId,
                    state: ALERT_STATE.ACKNOWLEDGED,
                });
                if (userId) {
                    await actions.assignUserToAlert(alertId, userId);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                throw new Error(alertId);
            }
        },
        async assignUserToAlert(alertId: string, assignee: string): Promise<AlertModel> {
            try {
                const alertData = await SpaceConnector.clientV2.monitoring.alert.assignUser<AlertAssignUserParameters, AlertModel>({
                    alert_id: alertId,
                    assignee,
                });
                return alertData;
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async getUserList() {
            try {
                state.loading = true;
                const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
                state.userIds = res.results?.map((d) => d.user_id) ?? [];
                state.totalUserCount = res.total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.userIds = [];
            } finally {
                state.loading = false;
            }
        },
    };
    return {
        state,
        ...actions,
    };
});
