import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import type { SharedConfigCreateParameters } from '@/api-clients/config/shared-config/schema/api-verbs/create';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigCreateParameters } from '@/api-clients/config/user-config/schema/api-verbs/create';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

type BookmarkLinkCreateResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkLinkCreateParameters = Partial<UserConfigCreateParameters | SharedConfigCreateParameters>;

interface UseBookmarkLinkCreateMutationOptions {
    type?: ComputedRef<BookmarkType>;
    onSuccess?: (data: BookmarkLinkCreateResult, variables: BookmarkLinkCreateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkLinkCreateParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkLinkCreateResult | undefined, error: Error|null, variables: BookmarkLinkCreateParameters) => void|Promise<void>;
}

export const useBookmarkLinkCreateMutation = (options?: UseBookmarkLinkCreateMutationOptions) => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list');
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list');

    return useMutation<BookmarkLinkCreateResult, Error, BookmarkLinkCreateParameters>({
        mutationFn: (params: BookmarkLinkCreateParameters) => {
            if (options?.type?.value === BOOKMARK_TYPE.USER) {
                return userConfigAPI.set(params as UserConfigCreateParameters);
            }
            return sharedConfigAPI.create(params as SharedConfigCreateParameters);
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
