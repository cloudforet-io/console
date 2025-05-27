import { useMutation } from '@tanstack/vue-query';

import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

interface UseBudgetCreateMutationOptions {
    onSuccess?: (data: BudgetModel, variables: BudgetCreateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BudgetCreateParameters) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null, variables: BudgetCreateParameters) => void|Promise<void>;
}

export const useBudgetCreateMutation = (options: UseBudgetCreateMutationOptions) => {
    const { budgetAPI } = useBudgetQuery();

    const {
        onSuccess, onError, onSettled,
    } = options;

    const createBudgetFn = async (params: BudgetCreateParameters): Promise<BudgetModel> => budgetAPI.create(params);

    return useMutation({
        mutationFn: createBudgetFn,
        onSuccess: async (data, variables) => {
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};
