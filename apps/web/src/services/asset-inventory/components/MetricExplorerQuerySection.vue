<script lang="ts" setup>
import {
    useElementSize,
} from '@vueuse/core';
import {
    reactive, ref,
} from 'vue';

import {
    PButton, PPopover, PBadge,
} from '@spaceone/design-system';

import MetricExplorerGranularityDropdown from '@/services/asset-inventory/components/MetricExplorerGranularityDropdown.vue';
import type { Granularity } from '@/services/asset-inventory/types/metric-explorer-type';


const filtersPopperRef = ref<any|null>(null);

const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);

const state = reactive({
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    selectedFiltersCount: 0,
});

/* event */
const handleClickFilter = () => {
    state.filtersPopoverVisible = !state.filtersPopoverVisible;
};
</script>

<template>
    <div class="metric-explorer-query-section">
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40 + 16: 16}px` }"
        >
            <div class="left-part">
                <!--operator-->
                <metric-explorer-granularity-dropdown />
                <!--period-->
                <p-popover :is-visible.sync="state.filtersPopoverVisible"
                           :class="{ 'open': state.filtersPopoverVisible }"
                           ignore-outside-click
                           trigger="click"
                           relative-style
                           position="bottom-start"
                           class="filters-popover"
                >
                    <p-button style-type="tertiary"
                              class="filters-button"
                              icon-left="ic_filter"
                              @click="handleClickFilter"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.FILTERS') }}
                        <p-badge v-if="state.selectedFiltersCount"
                                 badge-type="subtle"
                                 :style-type="state.filtersPopoverVisible ? 'gray100' : 'gray200'"
                                 class="filters-badge"
                        >
                            {{ state.selectedFiltersCount }}
                        </p-badge>
                    </p-button>
                    <template #content>
                        <!--popper-->
                    </template>
                </p-popover>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-query-section {
    margin-top: 1.5rem;
    .filter-wrapper {
        @apply relative flex items-center justify-between;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .filters-button {
            .filters-badge {
                margin-left: 0.25rem;
            }
        }

        /* custom design-system component - p-popover */
        :deep(.p-popover) {
            &.open {
                .p-button.filters-button {
                    @apply bg-gray-200;
                }
            }
            .popper {
                width: 100%;
                max-width: 100%;
                left: 2rem;
                transform: translate(0, 3rem) !important;
                .arrow {
                    left: 1.25rem !important;
                }
            }
        }
    }
}
</style>
