<script lang="ts" setup>
import { useElementSize } from '@vueuse/core';
import { useWindowSize } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { PVerticalLayout } from '@spaceone/design-system';

import { useGlobalUIStore } from '@/store/global-ui/global-ui-store';

import FNB from '@/common/modules/navigations/FNB.vue';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface Props {
    breadcrumbs?: Breadcrumb[];
}

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: undefined,
});

const containerRef = ref<HTMLElement|null>(null);

const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const globalUIStore = useGlobalUIStore();
const globalUIGetters = globalUIStore.getters;

const contentRef = ref<null | HTMLElement>(null);
const { width } = useWindowSize();
const { width: contentsWidth } = useElementSize(contentRef);

const storeState = reactive({
    isMinimizeGnb: computed(() => gnbGetters.isMinimizeGnb),
});
const state = reactive({
    padding: computed(() => {
        if (contentsWidth.value <= 1920) return '0';
        if (storeState.isMinimizeGnb) return width.value - 1980;
        return width.value - 2180;
    }),
});

watch(() => props.breadcrumbs, () => {
    const container = containerRef.value;
    if (container) {
        container.scrollTo(0, 0);
    }
});
</script>

<template>
    <p-vertical-layout v-bind="$props"
                       ref="contentRef"
                       class="vertical-page-layout"
                       v-on="$listeners"
    >
        <template #sidebar="prop">
            <slot name="sidebar"
                  :width="prop.width"
            />
        </template>
        <template #default>
            <div ref="containerRef"
                 class="right-container"
                 :style="{ height: globalUIGetters.appBodyHeight, paddingRight: `${state.padding}px` }"
            >
                <div class="header">
                    <slot name="handbook" />
                </div>
                <div class="page-contents">
                    <slot name="default" />
                </div>
                <div class="fnb">
                    <f-n-b />
                </div>
            </div>
        </template>
    </p-vertical-layout>
</template>

<style lang="postcss" scoped>
.vertical-page-layout {
    .right-container {
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        .header {
            @apply flex justify-between;
            padding: 1.5rem 1.5rem 0.25rem 1.5rem;
            &.without-breadcrumbs {
                padding: 0;
            }
        }

        .page-contents {
            flex-grow: 1;
            padding: 0 1.5rem 2rem 1.5rem;
            &.without-breadcrumbs {
                padding: 1.5rem 1.5rem 2rem 1.5rem;
            }
        }

        .fnb {
            width: 100%;
        }
    }
}
</style>
