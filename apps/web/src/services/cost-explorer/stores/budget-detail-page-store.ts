import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { BudgetUsageListParameters } from '@/api-clients/cost-analysis/budget-usage/schema/api-verbs/list';
import type { BudgetUsageModel } from '@/api-clients/cost-analysis/budget-usage/schema/model';
import type { BudgetGetParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/get';
import type { BudgetSetNotificationParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/set-notification';
import type { BudgetUpdateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/update';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useBudgetDetailPageStore = defineStore('page-budget-detail', {
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
        async updateBudgetData(params: { budgetId: string; updateParams: any }, type: string): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.update<BudgetUpdateParameters, BudgetModel>({
                    ...params.updateParams,
                    budget_id: params.budgetId,
                });
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
                    data: type.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                }), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, '');
            }
        },
        async updateBudgetNotifications(params: BudgetSetNotificationParameters, type: string): Promise<void> {
            try {
                this.budgetData = await SpaceConnector.clientV2.costAnalysis.budget.setNotification<BudgetSetNotificationParameters, BudgetModel>({
                    notification: params.notification,
                    budget_id: params.budget_id,
                });
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
                    data: type.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                }), '');
            } catch (e: any) {
                showErrorMessage(e.code, e.message);
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
