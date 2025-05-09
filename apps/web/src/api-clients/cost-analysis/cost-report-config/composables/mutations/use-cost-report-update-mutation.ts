import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import type { CostReportConfigUpdateParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/update';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


interface UseCostReportUpdateMutationOptions {
    onSuccess?: (data: CostReportConfigModel, variables: CostReportConfigUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: CostReportConfigUpdateParameters) => void|Promise<void>;
    onSettled?: (data: CostReportConfigModel|undefined, error: Error|null, variables: CostReportConfigUpdateParameters) => void|Promise<void>;
}

export const useCostReportUpdateMutation = (options: UseCostReportUpdateMutationOptions) => {
    const { costReportConfigAPI } = useCostReportConfigApi();
    const queryClient = useQueryClient();
    const { key: costReportConfigListQueryKey } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list');

    const {
        onSuccess, onError, onSettled,
    } = options;

    const updateFn = (params: CostReportConfigUpdateParameters): Promise<CostReportConfigModel> => {
        if (!params.cost_report_config_id) throw new Error('Cost report config ID is not provided');
        return costReportConfigAPI.update(params);
    };

    return useMutation({
        mutationFn: updateFn,
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: costReportConfigListQueryKey });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
