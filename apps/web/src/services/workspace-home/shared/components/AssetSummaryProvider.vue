<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import {
    computed, reactive, ref,
} from 'vue';

import { sortBy } from 'lodash';

import { PIconButton } from '@cloudforet/mirinae';

import AssetSummaryProviderItem from '@/services/workspace-home/shared/components/AssetSummaryProviderItem.vue';
import type { AssetProviderItem } from '@/services/workspace-home/shared/types/asset-provider-type';

const DEFAULT_PADDING = 24;
const PROVIDER_DEFAULT_WIDTH = 184 + 8;

const props = withDefaults(defineProps<{
    providers?: AssetProviderItem[];
}>(), {
    providers: () => [],
});

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const providerEl = ref<null | HTMLElement>(null);

const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const state = reactive({
    visibleCount: computed<number>(() => Math.floor((rowItemsWrapperWidth.value - DEFAULT_PADDING) / PROVIDER_DEFAULT_WIDTH)),
    pageStart: 0,
    pageMax: computed<number>(() => Math.max(props.providers.length - state.visibleCount, 0)),
    providerList: computed<AssetProviderItem[]>(() => sortBy(props.providers, (i) => i.order)),
});

const handleClickArrowButton = (increment: number) => {
    const element = {
        el: providerEl.value,
        defaultWidth: PROVIDER_DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart += increment;

    const marginLeft = increment * state.pageStart * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};
</script>

<template>
    <div ref="rowItemsWrapperRef"
         class="asset-summary-provider"
    >
        <div ref="providerEl"
             class="row-items-container"
        >
            <asset-summary-provider-item v-for="(item) in state.providerList"
                                         :key="item.provider"
                                         v-bind="item"
            />
        </div>
        <p-icon-button v-if="state.pageStart !== 0"
                       class="arrow-button left"
                       name="ic_chevron-left"
                       color="inherit transparent"
                       width="1.5rem"
                       height="1.5rem"
                       @click="handleClickArrowButton(-1)"
        />
        <p-icon-button v-if="state.pageStart !== Number(state.pageMax)"
                       class="arrow-button right"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       width="1.5rem"
                       height="1.5rem"
                       @click="handleClickArrowButton(1)"
        />
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-provider {
    @apply relative overflow-hidden;
    .row-items-container {
        @apply flex overflow-hidden;
        gap: 0.5rem;
        padding-left: 1.5rem;
        transition: margin-left 0.3s ease;
    }
    &::after {
        @apply absolute;
        content: '';
        top: 0;
        right: 0;
        width: 2rem;
        height: 100%;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
    }
    .arrow-button {
        @apply absolute bg-white border border-gray-300 rounded-full;
        top: calc(50% - 1rem);
        width: 2rem;
        height: 2rem;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        z-index: 10;
        &.left {
            margin-right: auto;
            left: 0.5rem;
        }
        &.right {
            margin-left: auto;
            right: 0.75rem;
        }
        &:hover, &:focus {
            @apply text-gray-900;
        }
    }

    /* custom design-system component - p-empty */
    :deep(.p-empty) {
        .image-wrapper {
            margin-bottom: 0.5rem;
        }
    }
}
</style>
