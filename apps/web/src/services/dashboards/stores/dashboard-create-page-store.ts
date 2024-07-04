import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateDashboardCreateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/create';
import type { PrivateWidgetListParameters } from '@/schema/dashboard/private-widget/api-verbs/list';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { PublicWidgetListParameters } from '@/schema/dashboard/public-widget/api-verbs/list';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import type { DashboardTemplateListParameters } from '@/schema/repository/dashboard-template/api-verbs/list';
import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


type WidgetModel = PublicWidgetModel | PrivateWidgetModel;
type DashboardCreateParameters = PublicDashboardCreateParameters | PrivateDashboardCreateParameters;
const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.list
            : SpaceConnector.clientV2.dashboard.publicWidget.list;
        const { results } = await fetcher<PublicWidgetListParameters|PrivateWidgetListParameters, ListResponse<WidgetModel>>({
            dashboard_id: dashboardId,
        });
        return results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
export const useDashboardCreatePageStore = defineStore('page-dashboard-create', () => {
    const appContextStore = useAppContextStore();
    const allReferenceStore = useAllReferenceStore();
    const dashboardStore = useDashboardStore();
    const dashboardGetters = dashboardStore.getters;
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    });
    const state = reactive({
        loading: false as boolean,
        currentStep: 1 as number,
        dashboardTemplates: [] as DashboardTemplateModel[],
        templateLabels: [] as string[],
        templateName: '' as string,
        // form
        selectedDashboardId: undefined as string | undefined,
        selectedTemplateId: undefined as string | undefined,
        dashboardName: '' as string,
        dashboardLabels: [] as string[],
        dashboardScope: 'WORKSPACE' as DashboardScope,
    });
    const getters = reactive({
        dashboardType: computed<DashboardType>(() => (state.dashboardScope === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC')),
    });

    /* Mutations */
    const setCurrentStep = (step: number) => { state.currentStep = step; };
    const setSelectedDashboardId = (dashboardId?: string) => { state.selectedDashboardId = dashboardId; };
    const setSelectedTemplateId = (templateId?: string) => { state.selectedTemplateId = templateId; };
    const setTemplateName = (name: string) => { state.templateName = name; };
    const setTemplateLabels = (labels: string[]) => { state.templateLabels = labels; };
    const setDashboardScope = (dashboardScope: DashboardScope) => { state.dashboardScope = dashboardScope; };
    const setDashboardName = (name: string) => { state.dashboardName = name; };
    const setDashboardLabels = (labels: string[]) => { state.dashboardLabels = labels; };
    const mutations = {
        setCurrentStep,
        setSelectedDashboardId,
        setSelectedTemplateId,
        setTemplateName,
        setTemplateLabels,
        setDashboardScope,
        setDashboardName,
        setDashboardLabels,
    };

    /* Actions */
    const reset = () => {
        setSelectedDashboardId();
        setSelectedTemplateId();
        setTemplateName('');
        setTemplateLabels([]);
        setDashboardScope('WORKSPACE');
        setDashboardName('');
        setDashboardLabels([]);
    };
    const listDashboardTemplates = async () => {
        try {
            const { results } = await SpaceConnector.clientV2.repository.dashboardTemplate.list<DashboardTemplateListParameters, ListResponse<DashboardTemplateModel>>({
            });
            state.dashboardTemplates = results || [];
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };
    const createDashboard = async (): Promise<string|undefined> => {
        state.loading = true;

        let _dashboardParams: DashboardCreateParameters = {};

        // template case
        if (state.selectedTemplateId) {
            const _template = state.dashboardTemplates.find((template) => template.template_id === state.selectedTemplateId);
            if (_template) {
                if (_template.template_type === 'SINGLE') {
                    const _dashboard = _template.dashboards[0];
                    _dashboardParams = {
                        name: state.dashboardName,
                        labels: state.dashboardLabels,
                        layouts: _dashboard.layouts,
                        options: _dashboard.options,
                        tags: { created_by: store.state.user.userId },
                    };
                }
            } else {
                // blank template
                _dashboardParams = {
                    name: state.dashboardName,
                    labels: state.dashboardLabels,
                    tags: { created_by: store.state.user.userId },
                };
            }
        }

        // existing dashboard case
        if (state.selectedDashboardId) {
            const _dashboard = dashboardGetters.allItems.find((dashboard) => dashboard.dashboard_id === state.selectedDashboardId);
            if (_dashboard) {
                const _dashboardLayouts = _dashboard.layouts;
                const _dashboardWidgets = await listDashboardWidgets(state.selectedDashboardId);
                const _sharedLayouts = await getSharedDashboardLayouts(_dashboardLayouts, _dashboardWidgets, storeState.costDataSource);
                _dashboardParams = {
                    name: state.dashboardName,
                    labels: state.dashboardLabels,
                    layouts: _sharedLayouts,
                    options: _dashboard.options,
                    tags: { created_by: store.state.user.userId },
                };
            }
        }

        try {
            if (storeState.isAdminMode) {
                _dashboardParams.resource_group = RESOURCE_GROUP.DOMAIN;
            } else if (getters.dashboardType !== 'PRIVATE') {
                _dashboardParams.resource_group = state.dashboardScope || RESOURCE_GROUP.WORKSPACE;
            }
            const res = await dashboardStore.createDashboard(getters.dashboardType, _dashboardParams);
            return res.dashboard_id;
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
            return undefined;
        } finally {
            state.loading = false;
        }
    };
    const actions = {
        listDashboardTemplates,
        reset,
        createDashboard,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
