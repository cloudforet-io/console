<script setup lang="ts">
import {
    computed, onMounted, reactive,
} from 'vue';

import { screens } from '@/index';
import BreadcrumbsEllipsisItem from '@/navigation/breadcrumbs/modules/BreadcrumbsEllipsisItem.vue';
import BreadcrumbsItem from '@/navigation/breadcrumbs/modules/BreadcrumbsItem.vue';
import type { Route } from '@/navigation/breadcrumbs/type';

interface Props {
    routes: Route[];
    copiable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    routes: () => [],
    copiable: false,
});

const emit = defineEmits<{(e: 'click', route: Route, idx: number): void}>();

const state = reactive({
    isShown: false,
    sliceMenuCount: props.routes.length,
    slicedMenu: computed(() => ({
        visible: props.routes.slice(-state.sliceMenuCount),
        hidden: props.routes.slice(0, props.routes.length - state.sliceMenuCount).map((route) => ({
            name: route.name,
            to: route.to,
            label: route.name,
        })),
    })),
});
const handleClickEllipsisItem = () => { state.isShown = true; };
const handleClickBreadcrumbsItem = (route, idx) => {
    emit('click', route, idx);
};
const isLengthOverFive = (idx) => props.routes.length < 5 || (props.routes.length >= 5 && (idx < 1 || idx > props.routes.length - 3)) || state.isShown;
const setSliceMenuCount = () => {
    if (window.innerWidth < screens.tablet.max && window.innerWidth > screens.mobile.max) {
        state.sliceMenuCount = 2;
    } else if (window.innerWidth < screens.mobile.max) {
        state.sliceMenuCount = 1;
    } else state.sliceMenuCount = props.routes.length;
};

window.addEventListener('resize', setSliceMenuCount);

onMounted(() => setSliceMenuCount());
</script>

<template>
    <div class="p-breadcrumbs">
        <span v-if="props.routes.length > 2 && state.sliceMenuCount < 3"
              class="breadcrumb-container"
        >
            <breadcrumbs-ellipsis-item :menu="state.slicedMenu.hidden" />
            <span v-for="(route, idx) in state.slicedMenu.visible"
                  :key="idx"
                  class="breadcrumb-wrapper"
            >
                <breadcrumbs-item :route="route"
                                  :routes="state.slicedMenu.visible"
                                  :copiable="props.copiable"
                                  :idx="idx"
                />
            </span>
        </span>
        <span v-for="(route, idx) in props.routes"
              v-else
              :key="idx"
              class="breadcrumb-container"
        >
            <span v-if="isLengthOverFive(idx)"
                  class="breadcrumb-wrapper"
            >
                <breadcrumbs-item :route="route"
                                  :routes="props.routes"
                                  :copiable="props.copiable"
                                  :idx="idx"
                                  @click="handleClickBreadcrumbsItem(route, idx)"
                />
            </span>
            <breadcrumbs-ellipsis-item v-if="props.routes.length >= 5 && idx === 2 && !state.isShown"
                                       @click="handleClickEllipsisItem"
            />
        </span>
    </div>
</template>

<style lang="postcss">
.p-breadcrumbs {
    @apply flex items-center;
    .breadcrumb-container {
        @apply inline-flex items-center;
        height: 1.25rem;
        .breadcrumb-wrapper {
            margin-right: 0.375rem;
            word-break: break-all;
        }
    }
}
</style>
