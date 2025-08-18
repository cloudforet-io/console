import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import { usePostApi } from '@/api-clients/board/post/composables/use-post-api';
import type { PostModel } from '@/api-clients/board/post/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

interface UsePostListPaginationQueryOptions {
    params: ComputedRef<AlertListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const usePostListPaginationQuery = ({ params, thisPage, pageSize }: UsePostListPaginationQueryOptions) => {
    const queryClient = useQueryClient();

    const { postAPI } = usePostApi();

    const { key: postListPaginationQueryKey, params: postListPaginationQueryParams } = useServiceQueryKey('board', 'post', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: postListPaginationQueryKey,
        queryFn: postAPI.list,
        params: postListPaginationQueryParams,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 2,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['DOMAIN', 'WORKSPACE']);

    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: postListPaginationQueryKey.value });
    };

    return {
        data: computed<PostModel[]>(() => query.data.value?.results || []),
        totalCount: computed<number>(() => query.data.value?.total_count || 0),
        isLoading: query.isLoading,
        refresh,
    };
};
