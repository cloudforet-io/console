<script setup lang="ts">
import {
    computed, onBeforeMount, onUnmounted,
} from 'vue';

import { PDataLoader, PButton } from '@cloudforet/mirinae';

import type { EventModel } from '@/api-clients/opsflow/event/schema/model';
import { i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';

import TaskProgressEventView from '@/services/ops-flow/components/TaskProgressEventView.vue';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const taskDetailPageStore = useTaskDetailPageStore();
const taskDetailPageState = taskDetailPageStore.state;
const taskDetailPageGetters = taskDetailPageStore.getters;
const userStore = useUserStore();

const timezone = computed(() => userStore.state.timezone);
const getTitle = (item: EventModel) => {
    if (item.event_type === 'CREATED') return _i18n.t('OPSFLOW.TASK_BOARD.CREATED');
    if (item.event_type === 'COMMENTED') return _i18n.t('OPSFLOW.TASK_BOARD.COMMENTED');
    if (item.event_type === 'CHANGE_STATUS') return _i18n.t('OPSFLOW.TASK_BOARD.CHANGE_STATUS');
    return _i18n.t('OPSFLOW.TASK_BOARD.UPDATED');
};
const getStyleType = (item: EventModel) => {
    if (item.event_type === 'CREATED') return 'gray';
    if (item.event_type === 'COMMENTED') return 'yellow';
    return 'violet';
};

onBeforeMount(async () => {
    await taskDetailPageStore.listEvents();
});

onUnmounted(() => {
    taskDetailPageStore.resetEvents();
});
</script>


<template>
    <div class="p-4 pb-0">
        <p-data-loader :loading="taskDetailPageGetters.firstLoadingEvents"
                       :data="taskDetailPageState.events"
        >
            <vertical-timeline-item
                v-for="(item, idx) in taskDetailPageState.events"
                :key="item.event_id"
                :title="getTitle(item)"
                :description="item.description"
                :datetime="item.created_at"
                :timezone="timezone"
                :style-type="getStyleType(item)"
                :is-last-item="idx === taskDetailPageState.events.length - 1"
                class="timeline"
            >
                <div class="text-label-sm text-gray-600">
                    <task-progress-event-view :task-type-id="taskDetailPageGetters.task?.task_type_id"
                                              :event-type="item.event_type"
                                              :additional-info="item.additional_info"
                    />
                </div>
            </vertical-timeline-item>
        </p-data-loader>
        <div class="flex justify-center mt-6">
            <p-button v-if="!taskDetailPageGetters.firstLoadingEvents
                          && taskDetailPageGetters.hasMoreEvents"
                      icon-right="ic_chevron-down"
                      size="sm"
                      style-type="secondary"
                      :loading="taskDetailPageState.loadingEvents"
                      @click="taskDetailPageStore.listEvents()"
            >
                {{ $t('OPSFLOW.SHOW_MORE') }}
            </p-button>
        </div>
    </div>
</template>
