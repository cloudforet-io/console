<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';

import {
    PFieldTitle, PIconButton, PLazyImg, PDivider, PTextButton,
} from '@cloudforet/mirinae';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';

const ITEM_DEFAULT_WIDTH = 120 + 8;
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
            title: 'title',
            icon: 'ic_notification-protocol_envelope',
        },
        {
            title: 'title1',
            icon: 'ic_notification-protocol_envelope',
        },
        {
            title: 'title2',
            icon: 'ic_notification-protocol_envelope',
        },
        {
            title: 'title3',
            icon: 'ic_notification-protocol_envelope',
        },
        {
            title: 'title4',
            icon: 'ic_notification-protocol_envelope',
        },
        {
            title: 'title1',
            icon: 'ic_notification-protocol_envelope',
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
    serviceDetailPageStore.setCurrentTab(SERVICE_DETAIL_TABS.NOTIFICATIONS)
);
</script>

<template>
    <div class="service-detail-tabs-overview-notification">
        <p-field-title class="field-title"
                       :label="$t('ALERT_MANAGER.NOTIFICATIONS.NOTIFICATIONS_CHANNEL')"
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
                         :key="`service-detail-notification-item-${idx}`"
                         class="item"
                    >
                        <div class="image-wrapper">
                            <p-lazy-img :src="assetUrlConverter(item.icon)"
                                        width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_notification-protocol_envelope"
                                        class="image"
                            />
                        </div>
                        <p class="text-label-md leading-8 flex-1">
                            {{ item.title }}
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
.service-detail-tabs-overview-notification {
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
            .image-wrapper {
                @apply flex items-center justify-center;
                width: 2rem;
                height: 2rem;
                padding: 0.375rem;
            }
            .item {
                @apply flex items-start bg-gray-100;
                width: 7.5rem;
                min-width: 7.5rem;
                padding: 0.375rem 0.5rem;
                border-radius: 0.75rem;
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
        margin-top: auto;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
