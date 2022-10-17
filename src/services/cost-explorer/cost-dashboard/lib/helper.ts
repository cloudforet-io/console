import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CustomLayout, DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { CostQueryFilterItem } from '@/services/cost-explorer/type';

export const fetchDefaultLayoutData = async (layoutId: string) => {
    try {
        // noinspection TypeScriptCheckImport
        const layoutTemplates = await import(`../dashboard-layouts/${layoutId}.json`);
        return layoutTemplates.default;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

export const getDashboardLayout = async (dashboard: DashboardInfo): Promise<CustomLayout[]> => {
    let layout: CustomLayout[];
    if (dashboard?.default_layout_id && dashboard.custom_layouts.length === 0) { // default dashboard
        layout = await fetchDefaultLayoutData(dashboard.default_layout_id);
    } else layout = dashboard.custom_layouts;
    costExplorerStore.commit('dashboard/setEditedCustomLayout', layout);
    return layout;
};

export const getCostDashboardFilterLabel = (filters: CostQueryFilterItem[]): string|undefined => {
    if (!filters.length) return undefined;
    const desc: string[] = [];
    Object.entries(FILTER_ITEM_MAP).forEach(([filterName, v]) => {
        const categoryFilters = filters.filter(d => d.category === filterName);
        if (categoryFilters.length) {
            const suffix = categoryFilters.length > 1 ? `${v.label}s` : v.label;
            desc.push(`${categoryFilters.length} ${suffix}`);
        }
    });
    if (desc.length) return desc.join(' & ');
    return undefined;
};
