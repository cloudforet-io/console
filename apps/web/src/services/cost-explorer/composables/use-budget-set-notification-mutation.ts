import { useMutation } from '@tanstack/vue-query';

import type { BudgetSetNotificationParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/set-notification';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

interface UseBudgetSetNotificationMutationOptions {
    onSuccess?: (data: BudgetModel, variables: BudgetSetNotificationParameters, type: string) => void|Promise<void>;
    onError?: (error: Error, variables: BudgetSetNotificationParameters) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null, variables: BudgetSetNotificationParameters) => void|Promise<void>;
}

export const useBudgetSetNotificationMutation = (options: UseBudgetSetNotificationMutationOptions) => {
    const { budgetAPI, queryClient } = useBudgetQuery();
    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const {
        onSuccess, onError, onSettled,
    } = options;

    const setNotificationFn = async (params: BudgetSetNotificationParameters & { __mutationType?: string }): Promise<BudgetModel> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __mutationType, ...pureParams } = params;
        return budgetAPI.setNotification(pureParams as BudgetSetNotificationParameters);
    };

    return useMutation({
        mutationFn: setNotificationFn,
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
