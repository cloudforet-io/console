import { orderBy } from 'lodash';

import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';

import { DOMAIN_DASHBOARD_VARS_SCHEMA_PRESET } from '@/services/dashboards/constants/dashboard-vars-schema-preset';

export const getOrderedGlobalVariables = (variables: DashboardGlobalVariable[]): DashboardGlobalVariable[] => {
    const _presetKeys: string[] = Object.keys(DOMAIN_DASHBOARD_VARS_SCHEMA_PRESET.properties);
    const _presetItems = variables.filter((d) => _presetKeys.includes(d.key));
    const _customItems = variables.filter((d) => !_presetKeys.includes(d.key));
    return [
        ...orderBy(_presetItems, 'name', 'asc'),
        ...orderBy(_customItems, 'name', 'asc'),
    ];
};
