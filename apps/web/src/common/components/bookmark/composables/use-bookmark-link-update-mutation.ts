import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import type { SharedConfigUpdateParameters } from '@/api-clients/config/shared-config/schema/api-verbs/update';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

type BookmarkLinkUpdateResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkLinkUpdateParameters = Partial<UserConfigUpdateParameters | SharedConfigUpdateParameters>;

interface UseBookmarkLinkUpdateMutationOptions {
    type?: ComputedRef<BookmarkType>;
    onSuccess?: (data: BookmarkLinkUpdateResult, variables: BookmarkLinkUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkLinkUpdateParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkLinkUpdateResult | undefined, error: Error|null, variables: BookmarkLinkUpdateParameters) => void|Promise<void>;
}

export const useBookmarkLinkUpdateMutation = (options?: UseBookmarkLinkUpdateMutationOptions) => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list');
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list');

    return useMutation<BookmarkLinkUpdateResult, Error, BookmarkLinkUpdateParameters>({
        mutationFn: (params: BookmarkLinkUpdateParameters) => {
            if (options?.type?.value === BOOKMARK_TYPE.USER) {
                return userConfigAPI.update(params as UserConfigUpdateParameters);
            }
            return sharedConfigAPI.update(params as SharedConfigUpdateParameters);
        },
        onSuccess: async (data, variables) => {
            if (options?.type?.value === BOOKMARK_TYPE.USER) {
                queryClient.invalidateQueries({ queryKey: userConfigListQueryKey.value });
            } else {
                queryClient.invalidateQueries({ queryKey: sharedConfigListQueryKey.value });
            }
            if (options?.onSuccess) await options.onSuccess(data, variables);
        },
        onError: (error, variables) => {
            ErrorHandler.handleError(error, true);
            if (options?.onError) options.onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (options?.onSettled) options.onSettled(data, error, variables);
        },
    });
};
