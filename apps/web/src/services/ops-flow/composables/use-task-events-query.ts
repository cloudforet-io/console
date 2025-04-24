import type { Ref } from 'vue';
import { computed } from 'vue';

import { useInfiniteQuery } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useEventApi } from '@/api-clients/opsflow/event/composables/use-event-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import ErrorHandler from '@/common/composables/error/errorHandler';

const EVENT_PAGE_SIZE = 10;
export const useTaskEventsQuery = ({
    taskId, fetchOnCreation,
}: {
  taskId: Ref<string|undefined>;
  fetchOnCreation: boolean;
}) => {
    const { eventAPI } = useEventApi();
    const listEventsQueryHelper = new ApiQueryHelper()
        .setMultiSortV2([{ key: 'created_at', desc: true }]);

    const { key: taskEventsQueryKey, params: taskEventsParams } = useServiceQueryKey('opsflow', 'event', 'list', {
        contextKey: taskId,
        params: computed(() => ({
            task_id: taskId.value as string,
            query: listEventsQueryHelper.dataV2,
        })),
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isLoading,
        refetch,
    } = useInfiniteQuery({
        queryKey: taskEventsQueryKey,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                listEventsQueryHelper.setPage((pageParam - 1) * EVENT_PAGE_SIZE + 1, EVENT_PAGE_SIZE);
                const res = await eventAPI.list(taskEventsParams.value);
                return {
                    results: res.results ?? [],
                    totalCount: res.total_count ?? 0,
                    page: pageParam,
                };
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to fetch events', true);
                return {
                    results: [],
                    totalCount: 0,
                    page: pageParam,
                };
            }
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page * EVENT_PAGE_SIZE < lastPage.totalCount) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: computed(() => fetchOnCreation && !!taskId.value),
    });

    const events = computed(() => {
        if (!data.value) return [];
        return data.value.pages.flatMap((page) => page.results);
    });


    return {
        events,
        isLoading,
        isFetching,
        hasNextPage,
        fetchNextPage,
        refetch,
    };
};
