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
// eslint-disable-next-line import/no-duplicates
import { computed, onBeforeMount, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton, PTab, PSkeleton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';

import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';

const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();

/* header and back button */
const loading = false; // computed<boolean>(() => taskCategoryStore.getters.loading);
const headerTitle = 'Inquiry Service Request'; // computed<string>(() => taskCategoryPageStore.getters.currentCategory?.name ?? 'No Category');
const {
    setPathFrom,
    handleClickBackButton,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: route.query.categoryId } as BoardPageQuery,
}));


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
const activeTab = computed(() => {
    if (route.name === OPS_FLOW_ROUTE.BOARD.TASK_CREATE.CONTENT._NAME) return 'content';
    return 'progress';
});
const handleUpdateActiveTab = (tab: string) => {
    if (tab === 'content') {
        router.replace(getProperRouteLocation({
            name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE.CONTENT._NAME,
            // TODO: query
        }));
    } else {
        router.replace(getProperRouteLocation({
            name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE.PROGRESS._NAME,
            // TODO: query
        }));
    }
};

/* lifecycle */
onBeforeMount(() => {
    // taskCategoryPageStore.setCurrentCategoryId(props.taskCategoryId);
});
onUnmounted(() => {
    // taskCategoryPageStore.$dispose();
});

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           @click-back-button="handleClickBackButton"
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
        <p-tab :tabs="tabs"
               :active-tab="activeTab"
               @update:active-tab="handleUpdateActiveTab"
        >
            <router-view />
        </p-tab>
    </div>
</template>

