<script setup lang="ts">
import {
    computed, onBeforeMount, onUnmounted,
} from 'vue';

import { PDataLoader, PButton } from '@cloudforet/mirinae';

import type { EventModel } from '@/schema/opsflow/event/model';


import { useUserStore } from '@/store/user/user-store';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';

import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const taskDetailPageStore = useTaskDetailPageStore();
const taskDetailPageState = taskDetailPageStore.state;
const taskDetailPageGetters = taskDetailPageStore.getters;
const userStore = useUserStore();

const timezone = computed(() => userStore.state.timezone);
const getStyleType = (item: EventModel) => {
    if (item.event_type === 'CREATED') return 'gray';
    if (item.event_type === 'COMMENTED') return 'yellow';
    return 'violet';
};

const handleClickItem = (item: EventModel) => {
    console.log('handleClickItem', item);
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
                :title="item.name"
                :description="item.description"
                :datetime="item.created_at"
                :timezone="timezone"
                :style-type="getStyleType(item)"
                :is-last-item="idx === taskDetailPageState.events.length - 1"
                class="timeline"
                @click="handleClickItem(item)"
            >
                <div class="text-label-sm text-gray-600">
                    {{ item.description }}
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
                Show More
            </p-button>
        </div>
    </div>
</template>
