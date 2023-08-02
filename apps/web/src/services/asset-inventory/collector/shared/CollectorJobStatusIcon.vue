<template>
    <router-link :to="props.to"
                 class="collector-job-status-icon"
                 :class="[props.styleType]"
                 custom
    >
        <template #default="{href, navigate}">
            <span>
                <a v-if="props.isArrow"
                   class="job-tooltip-wrapper"
                   :href="href"
                   @click.stop="navigate"
                >
                    <p-tooltip :contents="$t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL')"
                               :position="props.tooltipPosition"
                               class="job-tooltip"
                    >
                        <p-i
                            name="ic_chevron-right"
                            width="1.125rem"
                            height="1.125rem"
                            color="inherit"
                        />
                    </p-tooltip>
                </a>
                <a v-else
                   class="job-tooltip-wrapper"
                   :href="href"
                   @click.stop="navigate"
                >
                    <p-tooltip :contents="props.contents"
                               :position="props.tooltipPosition"
                               class="job-tooltip"
                    >
                        <p-i v-if="props.status === JOB_STATE.SUCCESS"
                             name="ic_check"
                             class="icon success"
                             height="1rem"
                             width="1rem"
                             color="inherit"
                        />
                        <p-i v-else-if="props.status === JOB_STATE.CANCELED"
                             name="ic_limit-filled"
                             class="icon canceled"
                             height="1rem"
                             width="1rem"
                             color="inherit"
                        />
                        <p-i v-else
                             name="ic_exclamation-mark"
                             class="icon error"
                             height="1rem"
                             width="1rem"
                             color="inherit"
                        />
                    </p-tooltip>
                </a>
            </span>
        </template>
    </router-link>
</template>

<script setup lang="ts">
import { PTooltip, PI } from '@spaceone/design-system';

import { JOB_STATE } from '@/services/asset-inventory/collector/type';

interface Props {
    to: string | object,
    contents?: string,
    status?: string,
    isArrow?: boolean,
    tooltipPosition?: string,
    styleType?: 'gray' | 'white',
}

const props = withDefaults(defineProps<Props>(), {
    to: '',
    contents: '',
    status: undefined,
    isArrow: false,
    tooltipPosition: 'top-end',
    styleType: 'gray',
});
</script>

<style lang="postcss" scoped>
.collector-job-status-icon {
    @apply rounded-full border border-white box-content;
    width: 1.375rem;
    height: 1.375rem;
    &.gray {
        @apply bg-gray-100;
    }
    &.white {
        @apply bg-white;
    }
    .job-tooltip-wrapper {
        @apply flex items-center justify-center;
        width: 1.375rem;
        height: 1.375rem;
        .job-tooltip {
            @apply flex items-center justify-center;
            .icon {
                &.success {
                    @apply text-green-500;
                }
                &.error {
                    @apply text-red-400;
                }
                &.canceled {
                    @apply text-gray-400;
                }
            }
        }
    }
    &:hover {
        @apply bg-blue-200;
        .job-tooltip {
            @apply text-blue-600;
            .icon {
                &.success {
                    @apply text-blue-600;
                }
                &.error {
                    @apply text-blue-600;
                }
                &.canceled {
                    @apply text-blue-600;
                }
            }
        }
    }
}
</style>
