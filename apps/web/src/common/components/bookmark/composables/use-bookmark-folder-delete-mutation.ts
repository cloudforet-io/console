import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import type { SharedConfigDeleteParameters } from '@/api-clients/config/shared-config/schema/api-verbs/delete';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigDeleteParameters } from '@/api-clients/config/user-config/schema/api-verbs/delete';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { useBookmarkLinkDeleteMutation } from '@/common/components/bookmark/composables/use-bookmark-link-delete-mutation';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

type BookmarkFolderDeleteResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkFolderDeleteParameters = Partial<UserConfigDeleteParameters | SharedConfigDeleteParameters>;

interface UseBookmarkFolderDeleteMutationOptions {
    type?: ComputedRef<BookmarkType>;
    bookmarkList?: ComputedRef<BookmarkItem[]>;
    onSuccess?: (data: BookmarkFolderDeleteResult, variables: BookmarkFolderDeleteParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkFolderDeleteParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkFolderDeleteResult | undefined, error: Error|null, variables: BookmarkFolderDeleteParameters) => void|Promise<void>;
}

export const useBookmarkFolderDeleteMutation = (options?: UseBookmarkFolderDeleteMutationOptions) => {
    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();
    const { mutate: deleteBookmarkLink } = useBookmarkLinkDeleteMutation({
        type: options?.type,
    });

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list');
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list');

    return useMutation<BookmarkFolderDeleteResult, Error, BookmarkFolderDeleteParameters>({
        mutationFn: (params: BookmarkFolderDeleteParameters) => {
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
            const foldersLinkItems = options?.bookmarkList?.value?.filter((i) => i.folder === variables?.name);
            if (foldersLinkItems) {
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await deleteBookmarkLink({
                        name: item.id || '',
                    });
                }));
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
