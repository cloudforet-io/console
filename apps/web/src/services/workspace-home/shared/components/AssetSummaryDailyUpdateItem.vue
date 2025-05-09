<script setup lang="ts">
import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';

import { PLazyImg, PI } from '@cloudforet/mirinae';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { DailyUpdateItem } from '@/services/workspace-home/shared/types/asset-daily-updates-type';



interface Props extends DailyUpdateItem {
    isCreateWarning?: boolean;
    isDeleteWarning?: boolean;
}

const props = defineProps<Props>();

const authorizationStore = useAuthorizationStore();

const state = reactive({
    accessLink: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.METRIC_EXPLORER])),
    // dailyUpdateItem: computed<CloudServiceItem>(() => ({
    //     cloudServiceGroup: props.item.cloudServiceGroup,
    //     cloudServiceType: props.item.cloudServiceType,
    //     icon: props.item.icon,
    //     isCreateWarning: props.item.create_warning,
    //     isDeleteWarning: props.item.delete_warning,
    //     totalCount: props.item.totalCount,
    //     createdCount: props.item.createdCount,
    //     deletedCount: props.item.deletedCount,
    // })),
});
</script>

<template>
    <div class="asset-summary-daily-update-item"
         :class="{'is-warning': props.isCreateWarning || props.isDeleteWarning}"
    >
        <p-lazy-img
            v-if="props.icon"
            :src="assetUrlConverter(props.icon)"
            width="1.25rem"
            height="1.25rem"
            class="icon"
        />
        <span class="title">{{ props.cloudServiceGroup }}/{{ props.cloudServiceType }}
            <span class="total-count">({{ props.totalCount }})</span>
        </span>
        <div v-if="props.createdCount"
             class="data-row created"
        >
            <span class="text-wrapper"
                  :class="{'no-access': !state.accessLink}"
            >
                <p-i v-if="props.isCreateWarning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <router-link :to="state.accessLink ? {
                    name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                    params: {
                        metricId: 'metric-managed-created-count',
                        groupBy: props.provider,
                        group: props.cloudServiceGroup,
                        type: props.cloudServiceType,
                    },
                } : {}"
                >
                    <span class="label">{{ $t('HOME.ASSET_SUMMARY_CREATED', { count: props.createdCount }) }}</span>
                </router-link>
            </span>
        </div>
        <div v-if="props.deletedCount"
             class="data-row deleted"
        >
            <span class="text-wrapper"
                  :class="{'no-access': !state.accessLink}"
            >
                <p-i v-if="props.isDeleteWarning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <router-link :to="state.accessLink ? {
                    name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                    params: {
                        metricId: 'metric-managed-deleted-count',
                        groupBy: props.provider,
                        group: props.cloudServiceGroup,
                        type: props.cloudServiceType,
                    },
                } : {}"
                >
                    <span class="label">{{ $t('HOME.ASSET_SUMMARY_DELETED', { count: props.deletedCount }) }}</span>
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
            &.no-access {
                @apply cursor-not-allowed;
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
