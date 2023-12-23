import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { BudgetUsageListParameters } from '@/schema/cost-analysis/budget-usage/api-verbs/list';
import type { BudgetUsageModel } from '@/schema/cost-analysis/budget-usage/model';
import type { BudgetGetParameters } from '@/schema/cost-analysis/budget/api-verbs/get';
import type { BudgetSetNotificationParameters } from '@/schema/cost-analysis/budget/api-verbs/set-notification';
import type { BudgetUpdateParameters } from '@/schema/cost-analysis/budget/api-verbs/update';
import type { BudgetModel } from '@/schema/cost-analysis/budget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useBudgetDetailPageStore = defineStore('budget-detail-page', {
    state: () => ({
        loading: true,
        budgetData: null as BudgetModel|null,
        budgetUsageData: null as BudgetUsageModel[]|null,
    }),
    actions: {
        async getBudgetData(budgetId: string): Promise<void> {
            this.loading = true;
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.get<BudgetGetParameters, BudgetModel>({
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
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.update<BudgetUpdateParameters, BudgetModel>({
                    ...params.updateParams,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async updateBudgetNotifications(params: { budgetId: string; notifications: BudgetModel['notifications'] }): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.setNotification<BudgetSetNotificationParameters, BudgetModel>({
                    notifications: params.notifications,
                    budget_id: params.budgetId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async getBudgetUsageData(budgetId: string): Promise<void> {
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.list<BudgetUsageListParameters, AnalyzeResponse<BudgetUsageModel>>({
                    budget_id: budgetId,
                });
                this.budgetUsageData = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
