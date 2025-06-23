import { useMutation } from '@tanstack/vue-query';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';

export interface BudgetUpdateMutationContext {
    type: 'BUDGET_MANAGER' | 'BUDGET_PLAN' | 'BUDGET_ALERT' | 'BUDGET_NAME';
  }

const formatMutationType = (type: BudgetUpdateMutationContext['type']): string => type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

interface UseBudgetUpdateMutationOptions {
    context?: BudgetUpdateMutationContext;
    onSuccess?: (data: BudgetModel) => void|Promise<void>;
    onError?: (error: Error) => void|Promise<void>;
    onSettled?: (data: BudgetModel|undefined, error: Error|null) => void|Promise<void>;
}


export const useBudgetUpdateMutation = (options: UseBudgetUpdateMutationOptions) => {
    const { budgetAPI, queryClient } = useBudgetQuery();
    const { withSuffix: budgetGetQueryKey } = useServiceQueryKey('cost-analysis', 'budget', 'get');

    const {
        context, onSuccess, onError, onSettled,
    } = options;

    return useMutation({
        mutationFn: budgetAPI.update,
        onSuccess: async (data) => {
            if (context?.type) {
                queryClient.setQueryData(budgetGetQueryKey(data.budget_id), data);
                if (context.type === 'BUDGET_NAME') {
                    showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.NAME_EDIT_SUCCESS'), '');
                } else {
                    const formattedType = formatMutationType(context.type);
                    showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
                        data: formattedType,
                    }), '');
                }
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

