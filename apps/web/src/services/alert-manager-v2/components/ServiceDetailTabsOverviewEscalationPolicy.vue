<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';

import {
    PFieldTitle, PIconButton, PDivider, PBadge, PTextButton,
} from '@cloudforet/mirinae';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/store/service-detail-page-store';

const ITEM_DEFAULT_WIDTH = 184 + 8;
const DEFAULT_LEFT_PADDING = 16;

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const itemEl = ref<null | HTMLElement>(null);

const serviceDetailPageStore = useServiceDetailPageStore();
const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const state = reactive({
    pageStart: 0,
    // TODO: temp data
    items: [
        {
            step: 1,
            channel: 40,
            user_group: 40,
        },
        {
            step: 2,
            channel: 40,
            user_group: 40,
        },
        {
            step: 3,
            channel: 40,
            user_group: 40,
        },
        {
            step: 4,
            channel: 40,
            user_group: 40,
        },
        {
            step: 5,
            channel: 40,
            user_group: 40,
        },
        {
            step: 6,
            channel: 40,
            user_group: 40,
        },
    ],
    visibleCount: computed<number>(() => Math.floor((rowItemsWrapperWidth.value - DEFAULT_LEFT_PADDING) / ITEM_DEFAULT_WIDTH)),
    pageMax: computed<number>(() => Math.max(state.items.length - state.visibleCount, 0)),
});

const handleClickArrowButton = (increment: number) => {
    const element = {
        el: itemEl.value,
        defaultWidth: ITEM_DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart += increment;

    const marginLeft = increment * state.pageStart * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};

const handleRouteDetail = () => (
    serviceDetailPageStore.setActiveTab(SERVICE_DETAIL_TABS.SETTINGS)
);
</script>

<template>
    <div class="service-detail-tabs-overview-escalation-policy">
        <p-field-title class="field-title"
                       :label="$t('ALERT_MANAGER.ESCALATION_POLICY.TITLE')"
                       size="lg"
                       font-weight="regular"
        />
        <div class="flex-1 pt-2">
            <div ref="rowItemsWrapperRef"
                 class="row-items-wrapper"
            >
                <div ref="itemEl"
                     class="row-items-container"
                >
                    <div v-for="(item, idx) in state.items"
                         :key="`service-detail-policy-item-${idx}`"
                         class="item"
                    >
                        <p-badge badge-type="solid-outline"
                                 style-type="gray500"
                                 class="mb-1"
                        >
                            {{ `STEP${item.step}` }}
                        </p-badge>
                        <p class="data-row">
                            <span>{{ $t('ALERT_MANAGER.ESCALATION_POLICY.CHANNEL') }}</span>
                            <span>{{ item.channel }}</span>
                        </p>
                        <p class="data-row">
                            <span>{{ $t('ALERT_MANAGER.ESCALATION_POLICY.USER_GROUP') }}</span>
                            <span>{{ item.user_group }}</span>
                        </p>
                    </div>
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
        </div>
        <div>
            <p-divider class="bg-gray-150" />
            <div class="link-wrapper">
                <p-text-button style-type="highlight"
                               @click="handleRouteDetail"
                >
                    {{ $t('ALERT_MANAGER.SERVICE.DETAILS') }}
                </p-text-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-escalation-policy {
    @apply flex flex-col;
    .field-title {
        padding: 1.375rem 1rem;
    }
    .row-items-wrapper {
        @apply relative overflow-hidden;
        .row-items-container {
            @apply flex overflow-hidden;
            gap: 0.5rem;
            padding-left: 1rem;
            transition: margin-left 0.3s ease;
            .item {
                @apply flex flex-col bg-gray-100 text-paragraph-sm border-l-4 border-gray-200 cursor-default;
                min-width: 11.5rem;
                width: 11.5rem;
                height: 6rem;
                padding: 1rem 0.75rem;
                border-radius: 0.375rem;
                .data-row {
                    @apply flex justify-between;
                    line-height: 1.375rem;
                }
            }
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
    }
    .link-wrapper {
        @apply flex items-center justify-center;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
