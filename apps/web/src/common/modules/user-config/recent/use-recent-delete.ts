import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { RecentType } from '@/common/modules/navigations/type';
import type { RecentItem } from '@/common/modules/user-config/recent/use-recent-list';



// NOTE: only name or type/itemId is required
interface RecentConfigDeleteParams {
    name?: string;
    type?: RecentType;
    itemId?: string;
}

export const useRecentDelete = () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const currentWorkspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);

    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { withSuffix } = useServiceQueryKey('config', 'user-config', 'list');

    return useMutation({
        mutationFn: (params: RecentConfigDeleteParams) => {
            const { name, type, itemId } = params;
            const _name = name ?? `console:recent:${type}:${currentWorkspaceId.value}:${itemId}`;

            return userConfigAPI.delete({
                name: _name,
            });
        },
        onSuccess: (_, variables) => {
            if (variables.name) {
                const _type = variables.name.split(':')[2] as RecentType;
                queryClient.setQueryData(
                    withSuffix(`console:recent:${_type}`),
                    (oldData: ListResponse<RecentItem>) => {
                        const newData = (oldData?.results ?? []).filter((item) => item.name !== variables.name);
                        return {
                            ...oldData,
                            results: newData,
                        };
                    },
                );
            } else {
                queryClient.setQueryData(
                    withSuffix(`console:recent:${variables.type}`),
                    (oldData: ListResponse<RecentItem>) => {
                        const newData = (oldData?.results ?? []).filter((item) => item.data.id !== variables.itemId);
                        return {
                            ...oldData,
                            results: newData,
                        };
                    },
                );
            }
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });
};
