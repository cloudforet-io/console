<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import {
    computed, reactive, ref,
} from 'vue';

import { PFieldTitle, PIconButton, PEmpty } from '@spaceone/design-system';
import {
    groupBy, map, sumBy,
} from 'lodash';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap, CloudServiceTypeItem } from '@/store/reference/cloud-service-type-reference-store';

import AssetSummaryDailyUpdateItem from '@/services/workspace-home/components/AssetSummaryDailyUpdateItem.vue';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import { DEFAULT_PADDING } from '@/services/workspace-home/types/workspace-home-type';
import type { CloudServiceData, DailyUpdatesListItem } from '@/services/workspace-home/types/workspace-home-type';

const DAILY_UPDATE__DEFAULT_WIDTH = 136 + 8;

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const dailyUpdateEl = ref<null | HTMLElement>(null);

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const storeState = reactive({
    cloudServiceTypeMap: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloud_service_type),
    dailyUpdatesListItems: computed<DailyUpdatesListItem>(() => workspaceHomePageState.dailyUpdatesListItems),
});
const state = reactive({
    cloudServiceTypeList: computed<CloudServiceTypeItem[]>(() => Object.values(storeState.cloudServiceTypeMap)),
    dailyUpdatesList: computed<CloudServiceData[]>(() => {
        const mergedArray = [...storeState.dailyUpdatesListItems.created, ...storeState.dailyUpdatesListItems.deleted];

        const grouped = groupBy(mergedArray, (item) => `${item.cloud_service_group}-${item.cloud_service_type}-${item.provider}`);

        return map(grouped, (group) => {
            const cloudServiceType = state.cloudServiceTypeList.find((i) => i.data.cloud_service_type_key === `${group[0].provider}.${group[0].cloud_service_group}.${group[0].cloud_service_type}`);
            return {
                cloud_service_group: cloudServiceType?.data.group,
                cloud_service_type: cloudServiceType?.name,
                total_count: sumBy(group, 'total_count') || 0,
                provider: cloudServiceType?.data.provider,
                icon: cloudServiceType?.icon,
                created_count: sumBy(group, 'created_count') || 0,
                deleted_count: sumBy(group, 'deleted_count') || 0,
            };
        });
    }),
    pageStart: 0,
    pageMax: computed(() => {
        const dailyUpdateCount: number = state.dailyUpdatesList.length / Math.floor(rowItemsWrapperWidth.value / (DAILY_UPDATE__DEFAULT_WIDTH + DEFAULT_PADDING) - 1);
        return Math.ceil(dailyUpdateCount);
    }),
});

const handleClickArrowButton = (increment: number) => {
    const element = {
        el: dailyUpdateEl.value,
        defaultWidth: DAILY_UPDATE__DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart += increment;

    const marginLeft = increment * state.pageStart * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};
</script>

<template>
    <div class="daily-update-wrapper">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_DAILY_UPDATE_TITLE')"
                       class="daily-update-title"
        >
            <template #right>
                <span class="desc">{{ $t('HOME.ASSET_SUMMARY_DAILY_UPDATE_DESC') }}</span>
            </template>
        </p-field-title>
        <div v-if="state.dailyUpdatesList.length > 0"
             ref="rowItemsWrapperRef"
             class="row-items-wrapper"
        >
            <div ref="dailyUpdateEl"
                 class="row-items-container"
            >
                <asset-summary-daily-update-item v-for="(item, idx) in state.dailyUpdatesList"
                                                 :key="`asset-summary-daily-update-item-${idx}`"
                                                 :item="item"
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
        <p-empty v-else
                 show-image
                 image-size="sm"
                 :title="$t('COMMON.WIDGETS.DAILY_UPDATE_NO_DATA')"
                 class="empty"
        >
            <template #image>
                <img alt="empty-image"
                     src="@/assets/images/illust_circle_boy.svg"
                >
            </template>
        </p-empty>
    </div>
</template>

<style scoped lang="postcss">
.daily-update-wrapper {
    @apply flex flex-col;
    gap: 0.75rem;
    .daily-update-title {
        padding-left: 1.5rem;
        .desc {
            @apply text-label-sm text-gray-600;
        }
    }

    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        .title-wrapper {
            @apply items-center;
            gap: 0.5rem;
        }
    }

    .row-items-wrapper {
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
            &:hover {
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

    .empty {
        width: calc(100% - 3rem);
        height: 10rem;
        margin-left: 1.5rem;
    }
}
</style>
