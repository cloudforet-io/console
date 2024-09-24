import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';
import type { DashboardTemplateListParameters } from '@/schema/repository/dashboard-template/api-verbs/list';
import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';



export const useDashboardCreatePageStore = defineStore('page-dashboard-create', () => {
    const state = reactive({
        loading: false as boolean,
        createType: 'SINGLE' as 'SINGLE' | 'BUNDLE',
        currentStep: 1 as number,
        dashboardCreated: false as boolean,
        dashboardTemplates: [] as DashboardTemplateModel[],
        templateLabels: [] as string[],
        templateName: '' as string,
        // single case
        selectedTemplateId: undefined as string | undefined,
        dashboardName: '' as string,
        dashboardLabels: [] as string[],
        dashboardScope: 'WORKSPACE' as 'WORKSPACE' | 'PRIVATE',
        // bundle case
        selectedTemplateIdMap: {} as Record<string, boolean>,
        selectedExistingDashboardIdMap: {} as Record<string, boolean>,
    });
    const getters = reactive({
        dashboardType: computed<DashboardType>(() => (state.dashboardScope === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC')),
        noBundleSelected: computed<boolean>(() => {
            const _isTemplateSelected = Object.values(state.selectedTemplateIdMap).some((v) => v);
            const _isExistingDashboardSelected = Object.values(state.selectedExistingDashboardIdMap).some((v) => v);
            return !_isTemplateSelected && !_isExistingDashboardSelected;
        }),
    });

    /* Mutations */
    const setLoading = (loading: boolean) => { state.loading = loading; };
    const setCurrentStep = (step: number) => { state.currentStep = step; };
    const setCreateType = (type: 'SINGLE' | 'BUNDLE') => { state.createType = type; };
    const setSelectedTemplateId = (templateId?: string) => { state.selectedTemplateId = templateId; };
    const setSelectedTemplateIdMap = (templateIdMap: Record<string, boolean>) => { state.selectedTemplateIdMap = templateIdMap; };
    const setSelectedExistingDashboardIdMap = (dashboardIdMap: Record<string, boolean>) => { state.selectedExistingDashboardIdMap = dashboardIdMap; };
    const setTemplateName = (name: string) => { state.templateName = name; };
    const setTemplateLabels = (labels: string[]) => { state.templateLabels = labels; };
    const setDashboardScope = (dashboardScope: DashboardScope) => { state.dashboardScope = dashboardScope; };
    const setDashboardName = (name: string) => { state.dashboardName = name; };
    const setDashboardLabels = (labels: string[]) => { state.dashboardLabels = labels; };
    const setDashboardCreated = (created: boolean) => { state.dashboardCreated = created; };
    const mutations = {
        setLoading,
        setCurrentStep,
        setCreateType,
        setSelectedTemplateId,
        setSelectedTemplateIdMap,
        setSelectedExistingDashboardIdMap,
        setTemplateName,
        setTemplateLabels,
        setDashboardScope,
        setDashboardName,
        setDashboardLabels,
        setDashboardCreated,
    };

    /* Actions */
    const reset = () => {
        setLoading(false);
        setCurrentStep(1);
        setCreateType('SINGLE');
        setSelectedTemplateId();
        setTemplateName('');
        setTemplateLabels([]);
        setDashboardScope('WORKSPACE');
        setDashboardName('');
        setDashboardLabels([]);
        setSelectedTemplateIdMap({});
        setSelectedExistingDashboardIdMap({});
        setDashboardCreated(false);
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
    const actions = {
        listDashboardTemplates,
        reset,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
