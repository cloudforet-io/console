import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EventListParameters } from '@/schema/opsflow/event/api-verbs/list';
import type { EventModel } from '@/schema/opsflow/event/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

const EVENT_PAGE_SIZE = 3;
interface UseTaskDetailPageStoreState {
    taskId?: string;
    page: number;
    loadingEvents: boolean;
    events?: EventModel[];
    lastTotalCount?: number;
}

interface UseTaskDetailPageStoreGetters {
    firstLoadingEvents: boolean;
    hasMoreEvents: boolean;
}

export const useTaskDetailPageStore = defineStore('task-detail-page', () => {
    const state = reactive<UseTaskDetailPageStoreState>({
        taskId: undefined,
        page: 1,
        loadingEvents: true,
        events: undefined,
        lastTotalCount: undefined,
    });
    const getters: UseTaskDetailPageStoreGetters = {
        firstLoadingEvents: computed<boolean>(() => !state.events),
        hasMoreEvents: computed<boolean>(() => {
            if (!state.events) return true;
            return state.events.length < (state.lastTotalCount ?? 0);
        }),
    } as unknown as UseTaskDetailPageStoreGetters; // HACK: to avoid type error

    const listEventsQueryHelper = new ApiQueryHelper()
        .setMultiSortV2([{ key: 'created_at', desc: true }]);
    const loadMoreEventsQueryHelper = new ApiQueryHelper()
        .setTimezone('UTC')
        .setMultiSortV2([{ key: 'created_at', desc: true }]);

    const fetchEventList = getCancellableFetcher<EventListParameters, ListResponse<EventModel>>(SpaceConnector.clientV2.opsflow.event.list);
    const actions = {
        setCurrentTaskId(taskId: string) {
            state.taskId = taskId;
        },
        async loadNewEvents() {
            try {
                if (!state.taskId) throw new Error('Task ID is not set');
                if (!state.events?.length) {
                    await actions.listEvents();
                    return;
                }

                loadMoreEventsQueryHelper.setFilters([{
                    k: 'created_at', v: state.events[0].created_at, o: '>t',
                }]);

                const res = await fetchEventList({
                    task_id: state.taskId,
                    query: loadMoreEventsQueryHelper.dataV2,
                });
                if (res.status === 'succeed') {
                    state.events = res.response.results ? [...res.response.results, ...state.events] : state.events;
                    state.page += res.response.results?.length ?? 0;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async listEvents() {
            try {
                if (!state.taskId) throw new Error('Task ID is not set');
                state.loadingEvents = true;
                if (state.lastTotalCount && state.events && state.events.length >= state.lastTotalCount) {
                    state.loadingEvents = false;
                    return;
                }

                listEventsQueryHelper.setPage(state.page, EVENT_PAGE_SIZE);
                const res = await fetchEventList({
                    task_id: state.taskId,
                    query: listEventsQueryHelper.dataV2,
                });
                if (res.status === 'succeed') {
                    state.page += EVENT_PAGE_SIZE;
                    state.events = state.events ? state.events.concat(res.response.results ?? []) : res.response.results ?? [];
                    const totalCount = res.response.total_count ?? 0;
                    if (state.lastTotalCount && totalCount > state.lastTotalCount) {
                        await actions.loadNewEvents();
                    } else {
                        state.lastTotalCount = totalCount;
                    }
                    state.loadingEvents = false;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loadingEvents = false;
            }
        },
        resetEvents() {
            state.page = 1;
            state.loadingEvents = true;
            state.events = undefined;
            state.lastTotalCount = undefined;
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
