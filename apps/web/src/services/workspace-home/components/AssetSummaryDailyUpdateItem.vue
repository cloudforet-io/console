<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import { PLazyImg, PI } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { CloudServiceData } from '@/services/workspace-home/types/workspace-home-type';

interface CloudServiceItem {
    cloudServiceGroup: string;
    cloudServiceType: string;
    icon?: string;
    isCreateWarning?: boolean;
    isDeleteWarning?: boolean;
    totalCount: number;
    createdCount: number;
    deletedCount: number;
    createdHref?: Location;
    deletedHref?: Location;
}

interface Props {
    item: CloudServiceData;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({} as CloudServiceData),
});

const state = reactive({
    dailyUpdateItem: computed<CloudServiceItem>(() => ({
        cloudServiceGroup: props.item.cloud_service_group,
        cloudServiceType: props.item.cloud_service_type,
        icon: props.item.icon,
        isCreateWarning: props.item.create_warning,
        isDeleteWarning: props.item.delete_warning,
        totalCount: props.item.total_count,
        createdCount: props.item.created_count,
        deletedCount: props.item.deleted_count,
        createdHref: {
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: {
                metricId: 'metric-managed-created-count',
                groupBy: props.item.provider,
                group: props.item.cloud_service_group,
                type: props.item.cloud_service_type,
            },
        },
        deletedHref: {
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: {
                metricId: 'metric-managed-deleted-count',
                groupBy: props.item.provider,
                group: props.item.cloud_service_group,
                type: props.item.cloud_service_type,
            },
        },
    })),
});
</script>

<template>
    <div class="asset-summary-daily-update-item"
         :class="{'is-warning': state.dailyUpdateItem.isCreateWarning || state.dailyUpdateItem.isDeleteWarning}"
    >
        <p-lazy-img
            v-if="state.dailyUpdateItem.icon"
            :src="assetUrlConverter(state.dailyUpdateItem.icon)"
            width="1.25rem"
            height="1.25rem"
            class="icon"
        />
        <span class="title">{{ state.dailyUpdateItem.cloudServiceGroup }}/{{ state.dailyUpdateItem.cloudServiceType }}
            <span class="total-count">({{ state.dailyUpdateItem.totalCount }})</span>
        </span>
        <div v-if="state.dailyUpdateItem.createdCount"
             class="data-row created"
        >
            <span class="text-wrapper">
                <p-i v-if="state.dailyUpdateItem.isCreateWarning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <router-link :to="state.dailyUpdateItem.createdHref">
                    <span class="label">{{ $t('HOME.ASSET_SUMMARY_CREATED', { count: state.dailyUpdateItem.createdCount }) }}</span>
                </router-link>
            </span>
        </div>
        <div v-if="state.dailyUpdateItem.deletedCount"
             class="data-row deleted"
        >
            <span class="text-wrapper">
                <p-i v-if="state.dailyUpdateItem.isDeleteWarning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <router-link :to="state.dailyUpdateItem.deletedHref">
                    <span class="label">{{ $t('HOME.ASSET_SUMMARY_DELETED', { count: state.dailyUpdateItem.deletedCount }) }}</span>
                </router-link>
            </span>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-daily-update-item {
    @apply flex flex-col border border-gray-200 cursor-default;
    min-width: 8.5rem;
    width: 8.5rem;
    height: 10rem;
    padding: 1rem;
    gap: 0.375rem;
    border-radius: 0.375rem;
    &.is-warning {
        background: linear-gradient(147.29deg, #fff3c5 0%, theme('colors.white') 107.36%);
    }
    .title {
        @apply text-label-md;
        flex: 1;
        .total-count {
            @apply font-medium;
        }
    }
    .data-row {
        @apply text-paragraph-sm;
        .text-wrapper {
            width: auto;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            border-radius: 0.25rem;
            .warning-icon {
                margin-top: -0.125rem;
                margin-right: 0.25rem;
            }
        }
        &.created {
            .text-wrapper {
                @apply bg-indigo-100 text-indigo-700;
            }
        }
        &.deleted {
            .text-wrapper {
                @apply bg-red-100 text-red-700;
            }
        }
    }
}
</style>
