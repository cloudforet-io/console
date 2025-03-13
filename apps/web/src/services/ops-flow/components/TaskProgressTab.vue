<script setup lang="ts">
import { computed } from 'vue';

import { PDataLoader, PButton } from '@cloudforet/mirinae';

import type { EventModel } from '@/api-clients/opsflow/event/schema/model';
import { i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';

import TaskProgressEventView from '@/services/ops-flow/components/TaskProgressEventView.vue';
import { useTaskEventsQuery } from '@/services/ops-flow/composables/use-task-events-query';
import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const taskDetailPageStore = useTaskDetailPageStore();
const taskDetailPageState = taskDetailPageStore.state;
const userStore = useUserStore();


const timezone = computed(() => userStore.state.timezone);
const getTitle = (item: EventModel) => {
    if (item.event_type === 'CREATED') return _i18n.t('OPSFLOW.TASK_BOARD.CREATED') as string;
    if (item.event_type === 'COMMENTED') return _i18n.t('OPSFLOW.TASK_BOARD.COMMENTED') as string;
    if (item.event_type === 'CHANGE_STATUS') return _i18n.t('OPSFLOW.TASK_BOARD.CHANGE_STATUS') as string;
    return _i18n.t('OPSFLOW.TASK_BOARD.UPDATED') as string;
};
const getStyleType = (item: EventModel) => {
    if (item.event_type === 'CREATED') return 'gray';
    if (item.event_type === 'COMMENTED') return 'yellow';
    return 'violet';
};

/* task */
const { data: task } = useTaskQuery({
    taskId: computed(() => taskDetailPageState.targetTaskId),
});

/* events */
const {
    events, fetchNextPage, isLoading, hasNextPage, isFetching,
} = useTaskEventsQuery({
    taskId: computed(() => taskDetailPageState.targetTaskId),
    fetchOnCreation: true,
});


</script>


<template>
    <div class="p-4 pb-0">
        <p-data-loader :loading="isLoading"
                       :data="events"
        >
            <vertical-timeline-item
                v-for="(item, idx) in events"
                :key="item.event_id"
                :title="getTitle(item)"
                :description="item.description"
                :datetime="item.created_at"
                :timezone="timezone"
                :style-type="getStyleType(item)"
                :is-last-item="idx === events.length - 1"
                class="timeline"
            >
                <div class="text-label-sm text-gray-600">
                    <task-progress-event-view :task-type-id="task?.task_type_id"
                                              :event-type="item.event_type"
                                              :additional-info="item.additional_info"
                    />
                </div>
            </vertical-timeline-item>
        </p-data-loader>
        <div class="flex justify-center mt-6">
            <p-button v-if="!isLoading && hasNextPage"
                      icon-right="ic_chevron-down"
                      size="sm"
                      style-type="secondary"
                      :loading="isFetching"
                      @click="fetchNextPage()"
            >
                {{ $t('OPSFLOW.SHOW_MORE') }}
            </p-button>
        </div>
    </div>
</template>
