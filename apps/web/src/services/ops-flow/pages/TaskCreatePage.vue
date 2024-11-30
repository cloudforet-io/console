<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates,import/order
import {
    computed, onBeforeMount, onUnmounted, defineAsyncComponent, ref,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton, PTab, PSkeleton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';

import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BoardTaskComment from '@/services/ops-flow/components/BoardTaskComment.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCreatePageStore } from '@/services/ops-flow/stores/task-create-page-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';

const TaskCreateContentTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskCreateContentTab.vue'));
const TaskCreateProgressTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskCreateProgressTab.vue'));

const router = useRouter();
const route = useRoute();

const taskCreatePageStore = useTaskCreatePageStore();

const { getProperRouteLocation } = useProperRouteLocation();


/* header and back button */
const loading = false; // computed<boolean>(() => taskCategoryStore.getters.loading);
const headerTitle = 'Inquiry Service Request'; // computed<string>(() => taskCategoryPageStore.getters.currentCategory?.name ?? 'No Category');
const {
    setPathFrom,
    goBack,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: route.query.categoryId } as BoardPageQuery,
}), true);
const isContentFilled = ref<boolean>(false);
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !isContentFilled.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* tabs */
const tabs = computed<TabItem<object>[]>(() => [
    {
        name: 'content',
        label: 'Content', // TODO: i18n
        keepAlive: true,
    },
    {
        name: 'progress',
        label: 'Progress', // TODO: i18n & template
        keepAlive: true,
    },
]);
const activeTab = ref<'content'|'progress'>('content');
const handleUpdateActiveTab = (tab: 'content'|'progress') => {
    activeTab.value = tab;
    router.replace({
        hash: `#${tab}`,
    });
};
const handleClickContentTabCancel = (isFilled: boolean) => {
    isContentFilled.value = isFilled;
    goBack();
};


const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));

/* lifecycle */
onBeforeMount(() => {
    taskCreatePageStore.setCurrentCategoryId(categoryId.value);
    if (route.hash === '#progress') {
        activeTab.value = 'progress';
    }
});
onUnmounted(() => {
    taskCreatePageStore.$dispose();
});

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           @click-back-button="goBack"
                >
                    <p-skeleton v-if="loading"
                                height="1.75rem"
                                width="12rem"
                    />
                    <template v-else>
                        {{ headerTitle }}
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <p-button style-type="negative-secondary">
                    Delete
                </p-button>
            </template>
        </p-heading-layout>
        <div class="mr-auto flex flex-wrap w-full gap-4">
            <p-tab class="flex-1 w-full min-w-[600px] tablet:min-w-full"
                   :tabs="tabs"
                   :active-tab="activeTab"
                   @update:active-tab="handleUpdateActiveTab"
            >
                <template #content>
                    <task-create-content-tab @cancel="handleClickContentTabCancel" />
                </template>
                <template #progress>
                    <task-create-progress-tab />
                </template>
            </p-tab>
            <board-task-comment class="flex-1 w-full min-w-[360px] lg:max-w-[528px] tablet:min-w-full" />
        </div>
        <!-- modals -->
        <confirm-back-modal :visible="isConfirmLeaveModalVisible"
                            @confirm="confirmRouteLeave"
                            @cancel="stopRouteLeave"
        />
    </div>
</template>

