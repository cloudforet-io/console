import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { RecentType } from '@/common/modules/navigations/type';
import type { RecentItem } from '@/common/modules/user-config/recent/use-recent-list';


interface RecentConfigCreateParams {
    type: RecentType;
    workspaceId: string;
    id: string;
    options?: {[key:string]: any};
}

export const useRecentCreate = () => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { withSuffix } = useServiceQueryKey('config', 'user-config', 'list');

    return useMutation({
        mutationFn: (params: RecentConfigCreateParams) => {
            const {
                workspaceId, id, type, ...options
            } = params;

            return userConfigAPI.set({
                name: `console:recent:${type}:${workspaceId}:${id}`,
                data: {
                    id,
                    workspace_id: workspaceId,
                    type,
                    ...options,
                },
            });
        },
        onSuccess: (_, variables) => {
            queryClient.setQueryData(
                withSuffix(`console:recent:${variables.type}`),
                (oldData: ListResponse<RecentItem>) => {
                    const newData = [...(oldData?.results ?? []), variables];
                    return {
                        ...oldData,
                        results: newData,
                    };
                },
            );
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });
};
