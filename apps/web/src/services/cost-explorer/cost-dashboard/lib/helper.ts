import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CustomLayout, DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type { CostFiltersMap } from '@/services/cost-explorer/type';

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
    return layout;
};

export const getCostDashboardFilterLabel = (filters?: CostFiltersMap): string|undefined => {
    if (!filters) return undefined;
    const desc: string[] = [];
    Object.entries(filters).forEach(([category, filterItems]) => {
        if (filterItems.length) {
            const categoryLabel = FILTER_ITEM_MAP[category].label;
            const suffix = filterItems.length > 1 ? `${categoryLabel}s` : categoryLabel;
            desc.push(`${filterItems.length} ${suffix}`);
        }
    });
    if (desc.length) return desc.join(' & ');
    return undefined;
};
