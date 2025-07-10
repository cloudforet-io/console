import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

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

type BookmarkFolderCreateResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkFolderCreateParameters = Partial<UserConfigCreateParameters | SharedConfigCreateParameters>;

interface UseBookmarkFolderCreateMutationOptions {
    type?: ComputedRef<BookmarkType>;
    onSuccess?: (data: BookmarkFolderCreateResult, variables: BookmarkFolderCreateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkFolderCreateParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkFolderCreateResult | undefined, error: Error|null, variables: BookmarkFolderCreateParameters) => void|Promise<void>;
}

export const useBookmarkFolderCreateMutation = (options?: UseBookmarkFolderCreateMutationOptions) => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();

    const defaultParams = new ApiQueryHelper().setFilters([
        { k: 'name', v: 'console:bookmark', o: '' },
    ]);

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list', {
        params: computed(() => ({ query: defaultParams.data })),
    });
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list', {
        params: computed(() => ({ query: defaultParams.data })),
    });

    return useMutation<BookmarkFolderCreateResult, Error, BookmarkFolderCreateParameters>({
        mutationFn: (params: BookmarkFolderCreateParameters) => {
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
