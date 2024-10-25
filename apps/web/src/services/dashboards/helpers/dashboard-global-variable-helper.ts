import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type { DashboardGlobalVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';

import {
    MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA,
} from '@/services/dashboards/constants/managed-dashboard-global-variables';



export const getRefinedGlobalVariables = (globalVarsSchema?: DashboardGlobalVariablesSchema): DashboardGlobalVariable[] => {
    if (!globalVarsSchema?.properties) return [];
    const _properties = globalVarsSchema?.properties;
    const _managedProperties = Object.values(_properties).filter((property) => property.management === 'managed');
    const _customProperties = Object.values(_properties).filter((property) => property.management === 'custom');
    const _refinedManagedProperties = _managedProperties.map((property) => ({
        ...MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA[property.key],
        ...property,
    }));
    return [..._refinedManagedProperties, ..._customProperties];
};
