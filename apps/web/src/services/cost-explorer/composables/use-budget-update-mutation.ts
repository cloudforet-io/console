import { useMutation } from '@tanstack/vue-query';

import type { BudgetUpdateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/update';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

interface UseBudgetUpdateMutationOptions {
    onSuccess?: (data: BudgetModel, variables: BudgetUpdateParameters, type: string) => void|Promise<void>;
    onError?: (error: Error, variables: BudgetUpdateParameters) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null, variables: BudgetUpdateParameters) => void|Promise<void>;
}

export const useBudgetUpdateMutation = (options: UseBudgetUpdateMutationOptions) => {
    const { budgetAPI, queryClient } = useBudgetQuery();
    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const {
        onSuccess, onError, onSettled,
    } = options;

    // Accept __mutationType and remove it before calling API (for internal use)
    const updateBudgetFn = async (
        params: BudgetUpdateParameters & { __mutationType?: string },
    ): Promise<BudgetModel> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __mutationType, ...pureParams } = params;
        return budgetAPI.update(pureParams as BudgetUpdateParameters);
    };

    return useMutation({
        mutationFn: updateBudgetFn,
        onSuccess: async (data, variables) => {
            const _budgetId = variables.budget_id;
            queryClient.setQueryData(budgetGetQueryKey(_budgetId), data);

            const type = (variables as any).__mutationType ?? 'unknown';
            if (onSuccess) await onSuccess(data, variables, type);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};

