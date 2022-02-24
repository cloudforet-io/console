import { keyBy } from 'lodash';
import { CustomLayout, DashboardInfo, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { FILTER } from '@/services/billing/cost-management/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';

export const fetchDefaultLayoutData = async (layoutId: string): Promise<any[]> => {
    try {
        // noinspection TypeScriptCheckImport
        const layoutTemplates = await import(`../dashboard-layouts/${layoutId}.json`);
        const widgets = await import('../../widgets/lib/defaultWidgetList.json');

        const optionsKeyByWidgetId = keyBy(widgets.default, option => option.widget_id);
        const layoutData: CustomLayout[] = layoutTemplates.default.map(layout => layout.map((d) => {
            const widget = optionsKeyByWidgetId[d.widget_id];
            return widget ? { ...widget, isInitialDefaultWidget: true } : {};
        }));
        return layoutData;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

export const getDashboardLayout = async (dashboard: DashboardInfo): Promise<CustomLayout[]> => {
    let layout: CustomLayout[];
    if (dashboard?.default_layout_id && dashboard.custom_layouts.length === 0) {
        layout = await fetchDefaultLayoutData(dashboard.default_layout_id);
    } else layout = dashboard.custom_layouts;
    store.commit('service/costDashboard/setEditedCustomLayout', layout);
    return layout;
};

export const getWidgetName = ({ name, isInitialDefaultWidget }: Partial<WidgetInfo>) => {
    if (isInitialDefaultWidget) return undefined;
    return name;
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
