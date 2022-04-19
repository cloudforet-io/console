import { CustomLayout, DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { FILTER } from '@/services/cost-explorer/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { costExplorerStore } from '@/services/cost-explorer/store';

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


export const getFiltersText = (filters) => {
    if (!filters) return 'None';
    const desc: string[] = [];
    if (filters[FILTER.PROJECT_GROUP]?.length) {
        const filterLength = filters[FILTER.PROJECT_GROUP].length;
        const suffix = filterLength > 1 ? 'Project Groups' : 'Project Group';
        desc.push(`${filterLength} ${suffix}`);
    } if (filters[FILTER.PROJECT]?.length) {
        const filterLength = filters[FILTER.PROJECT].length;
        const suffix = filterLength > 1 ? 'Projects' : 'Project';
        desc.push(`${filterLength} ${suffix}`);
    } if (filters[FILTER.SERVICE_ACCOUNT]?.length) {
        const filterLength = filters[FILTER.SERVICE_ACCOUNT].length;
        const suffix = filterLength > 1 ? 'Service Accounts' : 'Service Account';
        desc.push(`${filterLength} ${suffix}`);
    } if (filters[FILTER.PROVIDER]?.length) {
        const filterLength = filters[FILTER.PROVIDER].length;
        const suffix = filterLength > 1 ? 'Providers' : 'Provider';
        desc.push(`${filterLength} ${suffix}`);
    }
    if (desc.length) return desc.join(' & ');
    return 'None';
};
