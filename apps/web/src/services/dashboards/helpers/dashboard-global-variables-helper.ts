import { orderBy } from 'lodash';

import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';

import { DASHBOARD_VARS_SCHEMA_PRESET } from '@/services/dashboards/constants/dashboard-vars-schema-preset';

export const getOrderedGlobalVariables = (variables: DashboardGlobalVariable[]): DashboardGlobalVariable[] => {
    const _presetKeys: string[] = Object.keys(DASHBOARD_VARS_SCHEMA_PRESET.properties);
    console.debug('preset keys', _presetKeys, variables);
    const _presetItems = variables.filter((d) => _presetKeys.includes(d.key));
    const _customItems = variables.filter((d) => !_presetKeys.includes(d.key));
    return [
        ..._presetItems,
        ...orderBy(_customItems, 'name', 'asc'),
    ];
};
