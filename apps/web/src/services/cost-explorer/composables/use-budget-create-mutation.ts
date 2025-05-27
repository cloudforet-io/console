import { useMutation } from '@tanstack/vue-query';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

interface UseBudgetCreateMutationOptions {
    onSuccess?: (data: BudgetModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useBudgetCreateMutation = (options: UseBudgetCreateMutationOptions) => {
    const { budgetAPI } = useBudgetQuery();

    const {
        onSuccess, onError, onSettled,
    } = options;

    return useMutation({
        mutationFn: budgetAPI.create,
        onSuccess: async (data) => {
            if (onSuccess) await onSuccess(data);
        },
        onError: async (error) => {
            if (onError) await onError(error);
        },
        onSettled: async (data, error) => {
            if (onSettled) await onSettled(data, error);
        },
    });
};
