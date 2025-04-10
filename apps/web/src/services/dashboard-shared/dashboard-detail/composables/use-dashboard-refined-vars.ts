import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { cloneDeep, isEmpty } from 'lodash';

import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import WorkspaceVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-variable-model';

import { useDashboardRouteContext } from '@/services/dashboard-shared/core/composables/use-dashboard-route-context';
import { useDashboardGetQuery } from '@/services/dashboard-shared/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardDetailInfoStore } from '@/services/dashboard-shared/dashboard-detail/stores/dashboard-detail-info-store';


export const useDashboardRefinedVars = (dashboardId: ComputedRef<string|undefined>) => {
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailState = dashboardDetailStore.state;

    const { dashboard } = useDashboardGetQuery({
        dashboardId,
    });
    const { projectContextType, projectGroupOrProjectId, isAdminMode } = useDashboardRouteContext();

    const refinedVars = computed<DashboardVars>(() => {
        let _vars: DashboardVars = cloneDeep(dashboard.value?.vars ?? {});
        const tempVars: DashboardVars = cloneDeep(dashboardDetailState.vars ?? {});
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
