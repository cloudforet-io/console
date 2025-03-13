import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { EventModel } from '@/api-clients/opsflow/event/schema/model';

interface UseTaskDetailPageStoreState {
    // task
    targetTaskId?: string;
    visibleTaskDeleteModal: boolean;
    // events
    page: number;
    loadingEvents: boolean;
    events?: EventModel[];
    lastTotalCount?: number;
    // comments
    targetCommentId?: string;
    visibleCommentDeleteModal: boolean;
}


export const useTaskDetailPageStore = defineStore('task-detail-page', () => {
    const state = reactive<UseTaskDetailPageStoreState>({
        targetTaskId: undefined,
        visibleTaskDeleteModal: false,
        // events
        page: 1,
        loadingEvents: true,
        events: undefined,
        lastTotalCount: undefined,
        // comments
        targetCommentId: undefined,
        visibleCommentDeleteModal: false,
    });

    const actions = {
        setTargetTaskId(taskId: string) {
            state.targetTaskId = taskId;
        },
        // task modals
        openTaskDeleteModal() {
            state.visibleTaskDeleteModal = true;
        },
        closeTaskDeleteModal() {
            state.visibleTaskDeleteModal = false;
        },
        // comment modals
        openCommentDeleteModal(commentId: string) {
            state.targetCommentId = commentId;
            state.visibleCommentDeleteModal = true;
        },
        closeCommentDeleteModal() {
            state.visibleCommentDeleteModal = false;
            state.targetCommentId = undefined;
        },
    };

    return {
        state,
        ...actions,
    };
});
