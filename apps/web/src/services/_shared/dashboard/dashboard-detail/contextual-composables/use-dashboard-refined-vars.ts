import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { cloneDeep, isEmpty } from 'lodash';

import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import WorkspaceVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-variable-model';

import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { useDashboardVarsStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-vars-store';

export const useDashboardRefinedVars = (dashboardId: ComputedRef<string|undefined>) => {
    const dashboardVarsStore = useDashboardVarsStore();
    const dashboardVarsState = dashboardVarsStore.state;
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.state;

    const { dashboard } = useDashboardGetQuery({
        dashboardId,
    });
    const { projectContextType, projectGroupOrProjectId, isAdminMode } = useDashboardSharedContext();

    const refinedVars = computed<DashboardVars>(() => {
        let _vars: DashboardVars = cloneDeep(dashboard.value?.vars ?? {});
        const tempVars: DashboardVars = cloneDeep(dashboardVarsState.vars ?? {});
        if (!isEmpty(tempVars)) _vars = tempVars;
        if (projectGroupOrProjectId.value) {
            if (projectContextType.value === 'PROJECT') {
                _vars.project_id = [projectGroupOrProjectId.value];
            } else if (projectContextType.value === 'PROJECT_GROUP') {
                _vars.project_group_id = [projectGroupOrProjectId.value];
            }
        }

        const selectedWorkspaceId = dashboardDetailState.selectedWorkspaceId;
        if (isAdminMode.value) {
            if (selectedWorkspaceId && selectedWorkspaceId !== 'all') {
                _vars[WorkspaceVariableModel.meta.idKey] = [selectedWorkspaceId];
            } else {
                delete _vars[WorkspaceVariableModel.meta.idKey];
            }
        } else {
            delete _vars[WorkspaceVariableModel.meta.idKey];
        }
        return _vars;
    });
    return { refinedVars };
};
