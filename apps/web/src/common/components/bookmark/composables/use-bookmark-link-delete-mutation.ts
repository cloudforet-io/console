import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import type { SharedConfigDeleteParameters } from '@/api-clients/config/shared-config/schema/api-verbs/delete';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigDeleteParameters } from '@/api-clients/config/user-config/schema/api-verbs/delete';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

type BookmarkLinkDeleteResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkLinkDeleteParameters = Partial<UserConfigDeleteParameters | SharedConfigDeleteParameters>;

interface UseBookmarkLinkDeleteMutationOptions {
    type?: ComputedRef<BookmarkType>;
    onSuccess?: (data: BookmarkLinkDeleteResult, variables: BookmarkLinkDeleteParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkLinkDeleteParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkLinkDeleteResult | undefined, error: Error|null, variables: BookmarkLinkDeleteParameters) => void|Promise<void>;
}

export const useBookmarkLinkDeleteMutation = (options?: UseBookmarkLinkDeleteMutationOptions) => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list');
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list');

    return useMutation<BookmarkLinkDeleteResult, Error, BookmarkLinkDeleteParameters>({
        mutationFn: (params: BookmarkLinkDeleteParameters) => {
            if (options?.type?.value === BOOKMARK_TYPE.USER) {
                return userConfigAPI.delete(params as UserConfigDeleteParameters);
            }
            return sharedConfigAPI.delete(params as SharedConfigDeleteParameters);
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
