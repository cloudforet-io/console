import { useMutation } from '@tanstack/vue-query';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

export interface BudgetSetNotificationMutationContext {
    type: 'BUDGET_ALERTS' | 'ALERT_RECIPIENTS';
}

const formatMutationType = (type: BudgetSetNotificationMutationContext['type']): string => type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

interface UseBudgetSetNotificationMutationOptions {
    context?: BudgetSetNotificationMutationContext;
    onSuccess?: (data: BudgetModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null) => void|Promise<void>;
}

export const useBudgetSetNotificationMutation = (options: UseBudgetSetNotificationMutationOptions) => {
    const { budgetAPI, queryClient } = useBudgetQuery();
    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const {
        context, onSuccess, onError, onSettled,
    } = options;

    return useMutation({
        mutationFn: budgetAPI.setNotification,
        onSuccess: async (data) => {
            if (context?.type) {
                queryClient.setQueryData(budgetGetQueryKey(data.budget_id), data);

                const formattedType = formatMutationType(context.type);
                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
                    data: formattedType,
                }), '');
            }
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
