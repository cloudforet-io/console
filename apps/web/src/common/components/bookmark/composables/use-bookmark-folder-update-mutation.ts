import { computed, type ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import type { SharedConfigUpdateParameters } from '@/api-clients/config/shared-config/schema/api-verbs/update';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import type { UserConfigUpdateParameters } from '@/api-clients/config/user-config/schema/api-verbs/update';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useBookmarkLinkUpdateMutation } from '@/common/components/bookmark/composables/use-bookmark-link-update-mutation';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

type BookmarkFolderUpdateResult = UserConfigModel<Record<string, any>> | SharedConfigModel<Record<string, any>>;
type BookmarkFolderUpdateParameters = Partial<UserConfigUpdateParameters | SharedConfigUpdateParameters>;

interface UseBookmarkFolderUpdateMutationOptions {
    type?: ComputedRef<BookmarkType>;
    bookmarkList?: ComputedRef<BookmarkItem[]>;
    onSuccess?: (data: BookmarkFolderUpdateResult, variables: BookmarkFolderUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: BookmarkFolderUpdateParameters) => void|Promise<void>;
    onSettled?: (data: BookmarkFolderUpdateResult | undefined, error: Error|null, variables: BookmarkFolderUpdateParameters) => void|Promise<void>;
}

export const useBookmarkFolderUpdateMutation = (options?: UseBookmarkFolderUpdateMutationOptions) => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const appContextStore = useAppContextStore();

    const queryClient = useQueryClient();
    const { userConfigAPI } = useUserConfigApi();
    const { sharedConfigAPI } = useSharedConfigApi();
    const { mutate: updateBookmarkLink } = useBookmarkLinkUpdateMutation({
        type: options?.type,
    });

    const currentWorkspaceId = computed(() => userWorkspaceStore.getters.currentWorkspaceId);
    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);

    const { key: userConfigListQueryKey } = useServiceQueryKey('config', 'user-config', 'list');
    const { key: sharedConfigListQueryKey } = useServiceQueryKey('config', 'shared-config', 'list');

    return useMutation<BookmarkFolderUpdateResult, Error, BookmarkFolderUpdateParameters>({
        mutationFn: (params: BookmarkFolderUpdateParameters) => {
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
            const foldersLinkItems = options?.bookmarkList?.value?.filter((i) => i.folder === variables?.name);
            if (foldersLinkItems) {
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await updateBookmarkLink({
                        name: item.id || '',
                        data: {
                            workspaceId: currentWorkspaceId.value || '',
                            name: item.name as string || '',
                            folder: item.folder,
                            link: item.link || '',
                            isGlobal: isAdminMode.value,
                        },
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
