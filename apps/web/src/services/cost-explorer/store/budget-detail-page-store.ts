import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetUsageModel, BudgetNotifications, BudgetModel } from '@/services/cost-explorer/budget/model';


const allReferenceStore = useAllReferenceStore();

export const useBudgetDetailPageStore = defineStore('budget-detail-page', {
    state: () => ({
        loading: true,
        dataSourceId: undefined as string|undefined,
        budgetData: null as BudgetModel|null,
        budgetUsageData: null as BudgetUsageModel|null,
    }),
    getters: {
        currency: (state): Currency => {
            if (state.dataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[state.dataSourceId];
                return targetDataSource?.data?.plugin_info?.metadata?.currency ?? CURRENCY.USD;
            }
            return CURRENCY.USD;
        },
    },
    actions: {
        async getBudgetData(budgetId: string): Promise<void> {
            this.loading = true;
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.get({
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
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.update({
                    ...params.updateParams,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async updateBudgetNotifications(params: { budgetId: string; notifications: BudgetNotifications[] }): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.setNotification({
                    notifications: params.notifications,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async getBudgetUsageData(budgetId: string): Promise<void> {
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.list({
                    budget_id: budgetId,
                });
                this.budgetUsageData = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
