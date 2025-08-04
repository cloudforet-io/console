import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { usePostApi } from '@/api-clients/board/post/composables/use-post-api';
import type { PostModel } from '@/api-clients/board/post/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UsePostGetQueryReturn {
    postData: Ref<Partial<PostModel> | undefined>;
    isLoading: Ref<boolean>;
}

export const usePostGetQuery = (postId: ComputedRef<string>): UsePostGetQueryReturn => {
    const { postAPI } = usePostApi();

    const { key: postQueryKey, params: postQueryParams } = useServiceQueryKey('board', 'post', 'get', {
        params: computed(() => ({
            post_id: postId.value,
        })),
    });

    const { data: postData, isFetching } = useScopedQuery({
        queryKey: postQueryKey,
        queryFn: () => postAPI.get(postQueryParams.value),
        enabled: computed(() => !!postId.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        postData: computed(() => postData.value),
        isLoading: computed(() => isFetching.value),
    };
};
