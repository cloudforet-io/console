import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetUsageModel, BudgetNotifications, BudgetModel } from '@/services/cost-explorer/budget/model';


export const useBudgetPageStore = defineStore('budget-page', {
    state: () => ({
        loading: true,
        budgetData: null as BudgetModel|null,
        budgetUsageData: null as BudgetUsageModel|null,
    }),
    actions: {
        async getBudgetData(budgetId: string): Promise<void> {
            this.loading = true;
            try {
                this.budgetData = await SpaceConnector.client.costAnalysis.budget.get({
                    budget_id: budgetId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                this.loading = false;
            }
        },
        async updateBudgetData(params: { budgetId: string; updateParams: any }): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.client.costAnalysis.budget.update({
                    ...params.updateParams,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async updateBudgetNotifications(params: { budgetId: string; notifications: BudgetNotifications[] }): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.client.costAnalysis.budget.setNotification({
                    notifications: params.notifications,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async getBudgetUsageData(budgetId: string): Promise<void> {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.list({
                    budget_id: budgetId,
                });
                this.budgetUsageData = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
