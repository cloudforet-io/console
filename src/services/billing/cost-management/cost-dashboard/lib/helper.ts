import { keyBy } from 'lodash';
import { CustomLayout, DashboardInfo, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
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
