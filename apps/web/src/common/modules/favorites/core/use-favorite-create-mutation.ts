import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import type { ConfigData, ReferenceData } from '@/common/composables/config-data';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

export const useFavoriteCreateMutation = () => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { withSuffix } = useServiceQueryKey('config', 'user-config', 'list');

    return useMutation({
        mutationFn: (params: ConfigData|ReferenceData) => {
            const { itemType, workspaceId, itemId } = params;

            return userConfigAPI.set({
                name: itemType === FAVORITE_TYPE.WORKSPACE
                    ? `console:favorite:${itemType}:${itemId}`
                    : `console:favorite:${itemType}:${workspaceId}:${itemId}`,
                data: {
                    ...params,
                    type: 'item',
                },
            });
        },
        onSuccess: (_, variables) => {
            const configDataType = variables.itemType === FAVORITE_TYPE.WORKSPACE ? 'console:favorite:WORKSPACE' : 'console:favorite';
            queryClient.invalidateQueries({ queryKey: withSuffix(configDataType) });
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });
};
