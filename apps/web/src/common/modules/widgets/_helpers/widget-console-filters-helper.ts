import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardVariables } from '@/schema/dashboard/_types/dashboard-type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';


export const getWidgetConsoleFilters = (dashboardVariables?: DashboardVariables): ConsoleFilter[] => {
    if (!dashboardVariables) return [];
    const _results: ConsoleFilter[] = [];
    Object.entries(dashboardVariables || {}).forEach(([k, v]) => {
        const idKey = MANAGED_VARIABLE_MODELS[k]?.meta.idKey;
        if (idKey) {
            _results.push({
                k: idKey,
                v,
                o: '=',
            });
        }
    });
    return _results;
};
