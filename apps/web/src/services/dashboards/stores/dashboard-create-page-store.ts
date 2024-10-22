import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardType, AdminDashboardType } from '@/schema/dashboard/_types/dashboard-type';
import type { DashboardTemplateListParameters } from '@/schema/repository/dashboard-template/api-verbs/list';
import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';

import ErrorHandler from '@/common/composables/error/errorHandler';



export const useDashboardCreatePageStore = defineStore('page-dashboard-create', () => {
    const state = reactive({
        loading: false as boolean,
        createType: 'SINGLE' as 'SINGLE' | 'BUNDLE',
        currentStep: 1 as number,
        dashboardCreated: false as boolean,
        dashboardTemplates: [] as DashboardTemplateModel[],
        // single case
        dashboardScope: 'WORKSPACE' as 'WORKSPACE' | 'PRIVATE',
        // bundle case
        selectedOotbIdMap: {} as Record<string, boolean>,
        selectedExistingDashboardIdMap: {} as Record<string, boolean>,
        // only for admin
        adminDashboardType: 'WORKSPACE' as AdminDashboardType,
    });
    const getters = reactive({
        dashboardType: computed<DashboardType>(() => (state.dashboardScope === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC')),
        noBundleSelected: computed<boolean>(() => {
            const _isOotbSelected = Object.values(state.selectedOotbIdMap).some((v) => v);
            const _isExistingDashboardSelected = Object.values(state.selectedExistingDashboardIdMap).some((v) => v);
            return !_isOotbSelected && !_isExistingDashboardSelected;
        }),
    });

    /* Mutations */
    const setLoading = (loading: boolean) => { state.loading = loading; };
    const setCurrentStep = (step: number) => { state.currentStep = step; };
    const setCreateType = (type: 'SINGLE' | 'BUNDLE') => { state.createType = type; };
    const setSelectedOotbIdMap = (templateIdMap: Record<string, boolean>) => { state.selectedOotbIdMap = templateIdMap; };
    const setSelectedExistingDashboardIdMap = (dashboardIdMap: Record<string, boolean>) => { state.selectedExistingDashboardIdMap = dashboardIdMap; };
    // const setTemplateName = (name: string) => { state.templateName = name; };
    const setDashboardScope = (dashboardScope: 'WORKSPACE'|'PRIVATE') => { state.dashboardScope = dashboardScope; };
    const setDashboardCreated = (created: boolean) => { state.dashboardCreated = created; };
    const setAdminDashboardType = (type: AdminDashboardType) => { state.adminDashboardType = type; };
    const mutations = {
        setLoading,
        setCurrentStep,
        setCreateType,
        setSelectedOotbIdMap,
        setSelectedExistingDashboardIdMap,
        setDashboardScope,
        setDashboardCreated,
        setAdminDashboardType,
    };

    /* Actions */
    const reset = () => {
        state.loading = false;
        state.currentStep = 1;
        state.createType = 'SINGLE';
        state.dashboardScope = 'WORKSPACE';
        state.selectedOotbIdMap = {};
        state.selectedExistingDashboardIdMap = {};
        state.dashboardCreated = false;
        state.adminDashboardType = 'WORKSPACE';
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
