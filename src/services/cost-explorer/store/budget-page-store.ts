import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetData, BudgetUsageData, BudgetNotifications } from '@/services/cost-explorer/budget/type';


export const useBudgetPageStore = defineStore('budget-page', () => {
    const state = reactive({
        loading: true,
        budgetData: null as BudgetData|null,
        budgetUsageData: null as BudgetUsageData|null,
    });

    const getBudgetData = async (budgetId: string): Promise<void|Error> => {
        state.loading = true;
        try {
            state.budgetData = await SpaceConnector.client.costAnalysis.budget.get({
                budget_id: budgetId,
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        } finally {
            state.loading = false;
        }
    };
    const updateBudgetData = async (params: { budgetId: string; updateParams: any }): Promise<void|Error> => {
        try {
            state.budgetData = await SpaceConnector.client.costAnalysis.budget.update({
                ...params.updateParams,
                budget_id: params.budgetId,
            });
        } catch (e) {
            ErrorHandler.handleRequestError(e, '');
        }
    };
    const updateBudgetNotifications = async (params: { budgetId: string; notifications: BudgetNotifications[] }): Promise<void|Error> => {
        try {
            state.budgetData = await SpaceConnector.client.costAnalysis.budget.setNotification({
                notifications: params.notifications,
                budget_id: params.budgetId,
            });
        } catch (e) {
            ErrorHandler.handleRequestError(e, '');
        }
    };
    const getBudgetUsageData = async (budgetId: string): Promise<void|Error> => {
        try {
            const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.list({
                budget_id: budgetId,
            });
            state.budgetUsageData = results;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };


    return {
        state,
        getBudgetData,
        updateBudgetData,
        updateBudgetNotifications,
        getBudgetUsageData,
    };
});
