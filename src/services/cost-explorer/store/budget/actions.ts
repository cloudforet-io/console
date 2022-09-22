import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetData, BudgetNotifications, BudgetUsageData } from '@/services/cost-explorer/budget/type';
import type { UpdateBudgetParams } from '@/services/cost-explorer/store/budget/type';

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
        ErrorHandler.handleRequestError(e, '');
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
        ErrorHandler.handleRequestError(e, '');
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
