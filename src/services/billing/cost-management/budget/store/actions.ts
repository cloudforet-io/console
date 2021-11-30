import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { BudgetData, BudgetNotifications, BudgetUsageData } from '@/services/billing/cost-management/budget/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { UpdateBudgetParams } from '@/services/billing/cost-management/budget/store/type';

export const getBudgetData = async ({ commit }, budgetId: string): Promise<void|Error> => {
    try {
        const budget: BudgetData = await SpaceConnector.client.costAnalysis.budget.get({
            budget_id: budgetId,
        });
        commit('setBudgetData', budget);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const updateBudgetData = async ({ commit }, params: UpdateBudgetParams): Promise<void|Error> => {
    try {
        const budget: BudgetData = await SpaceConnector.client.costAnalysis.budget.update({
            ...params.updateParams,
            budget_id: params.budgetId,
        });
        commit('setBudgetData', budget);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const updateBudgetNotifications = async ({ commit }, params: { budgetId: string; notifications: BudgetNotifications[] }): Promise<void|Error> => {
    try {
        const budget: BudgetData = await SpaceConnector.client.costAnalysis.budget.setNotification({
            notifications: params.notifications,
            budget_id: params.budgetId,
        });
        commit('setBudgetData', budget);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const getBudgetUsageData = async ({ commit }, budgetId: string): Promise<void|Error> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.list({
            budget_id: budgetId,
        });
        const usage: BudgetUsageData = results;
        commit('setBudgetUsageData', usage);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
