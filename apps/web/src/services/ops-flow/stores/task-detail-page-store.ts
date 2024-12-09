import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CommentModel } from '@/schema/opsflow/comment/model';
import type { EventListParameters } from '@/schema/opsflow/event/api-verbs/list';
import type { EventModel } from '@/schema/opsflow/event/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

const EVENT_PAGE_SIZE = 3;
interface UseTaskDetailPageStoreState {
    // task
    taskId?: string;
    visibleTaskDeleteModal: boolean;
    // events
    page: number;
    loadingEvents: boolean;
    events?: EventModel[];
    lastTotalCount?: number;
    // comments
    visibleCommentDeleteModal: boolean;
    targetComment?: CommentModel;
}

interface UseTaskDetailPageStoreGetters {
    firstLoadingEvents: boolean;
    hasMoreEvents: boolean;
}

export const useTaskDetailPageStore = defineStore('task-detail-page', () => {
    const state = reactive<UseTaskDetailPageStoreState>({
        // task
        taskId: undefined,
        visibleTaskDeleteModal: false,
        // events
        page: 1,
        loadingEvents: true,
        events: undefined,
        lastTotalCount: undefined,
        // comments
        visibleCommentDeleteModal: false,
        targetComment: undefined,
    });
    const getters: UseTaskDetailPageStoreGetters = {
        // events
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
        // task
        setCurrentTaskId(taskId: string) {
            state.taskId = taskId;
        },
        openTaskDeleteModal() {
            state.visibleTaskDeleteModal = true;
        },
        closeTaskDeleteModal() {
            state.visibleTaskDeleteModal = false;
        },
        // events
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
                    const totalCount = res.response.total_count ?? 0;
                    let addedEvents = res.response.results ?? [];
                    if (state.lastTotalCount && totalCount > state.lastTotalCount) {
                        const diff = totalCount - state.lastTotalCount;
                        addedEvents = addedEvents.slice(diff);
                        await actions.loadNewEvents();
                    }
                    state.page += addedEvents.length;
                    state.events = state.events ? state.events.concat(addedEvents) : addedEvents;
                    state.lastTotalCount = totalCount;
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
        // comments
        openCommentDeleteModal(comment: CommentModel) {
            state.targetComment = comment;
            state.visibleCommentDeleteModal = true;
        },
        closeCommentDeleteModal() {
            state.visibleCommentDeleteModal = false;
            state.targetComment = undefined;
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
