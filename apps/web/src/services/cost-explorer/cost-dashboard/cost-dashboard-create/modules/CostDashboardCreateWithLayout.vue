<template>
    <div class="basic-dashboard">
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.BASIC_TEMPLATE') }}</h3>
        <div class="dashboard-list">
            <div v-for="(layoutData, idx) in defaultLayoutData"
                 :key="layoutData.name"
                 class="dashboard-item"
            >
                <!--                TODO:: apply keyboard event below this SelectCard-->
                <p-select-card
                    :selected="costDashboardPageState.selectedTemplate"
                    :value="layoutData"
                    block
                    @change="handleLayoutChange"
                >
                    {{ layoutData.name }}
                </p-select-card>
                <div v-if="layoutData.widgetList.length"
                     class="widget-list-wrapper"
                >
                    <div class="widget-title-wrapper">
                        <span class="widget-list-title">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.LIST_OF_WIDGETS') }}</span>
                        <p-collapsible-toggle :is-collapsed="!unfoldedIndices.includes(idx)"
                                              toggle-position="contents"
                                              @update:isCollapsed="handleUpdateCollapsed(idx, ...arguments)"
                        />
                    </div>
                    <ul v-if="unfoldedIndices.includes(idx)"
                        class="widgets-list"
                    >
                        <template v-if="layoutData.widgetList.length > 10">
                            <li v-for="({name}) in getNamesOfWidgetList(layoutData.widgetList).slice(0, 10)"
                                :key="name"
                            >
                                {{ name }}
                            </li>
                            <li class="text-more">
                                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.AND_MORE') }}
                            </li>
                        </template>
                        <template v-else>
                            <li v-for="({name}) in getNamesOfWidgetList(layoutData.widgetList)"
                                :key="name"
                            >
                                {{ name }}
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { reactive, toRefs } from 'vue';

import {
    PCollapsibleToggle, PSelectCard,
} from '@spaceone/design-system';
import { flattenDeep, startCase } from 'lodash';

import { defaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/config';
import type { DefaultLayout, WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';


const getNamesOfWidgetList = (widgetList) => {
    const flattenWidgetList: WidgetInfo[] = flattenDeep(widgetList);
    if (flattenWidgetList) return flattenWidgetList.map((d) => ({ name: startCase(defaultWidgetMap[d.widget_id].widget_file_name) }));
    return [];
};

export default {
    name: 'CostDashboardCreateWithLayout',
    components: {
        PSelectCard,
        PCollapsibleToggle,
    },

    setup() {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.$state;

        const state = reactive({
            selectedLayout: {} as Record<string, DefaultLayout>,
            unfoldedIndices: [] as number[],
        });

        const handleUpdateCollapsed = (idx: number, isCollapsed: boolean) => {
            const foundIdx = state.unfoldedIndices.findIndex((d) => d === idx);
            if (isCollapsed) {
                if (foundIdx !== -1) {
                    state.unfoldedIndices.splice(foundIdx, 1);
                }
            } else if (foundIdx === -1) {
                state.unfoldedIndices.push(idx);
            }
        };

        const handleLayoutChange = (value: Record<string, DefaultLayout>) => {
            costDashboardPageStore.$patch((_state) => {
                _state.selectedTemplate = value;
                _state.defaultFilter = {};
            });
        };

        return {
            ...toRefs(state),
            costDashboardPageState,
            defaultLayoutData,
            handleUpdateCollapsed,
            handleLayoutChange,
            getNamesOfWidgetList,
        };
    },
};
</script>
<style lang="postcss" scoped>
.basic-dashboard {
    h3 {
        @apply font-bold mb-3 pt-0;
        font-size: 0.875rem;
    }
    .dashboard-list {
        @apply grid grid-cols-4 col-gap-2 mb-2;
        .dashboard-item {
            @apply mb-4;
        }

        /* custom design-system component - p-select-card */
        :deep(.p-select-card) {
            font-size: 0.875rem;
            .contents {
                @apply font-bold;
            }
        }
    }
    .widget-list-wrapper {
        .widget-title-wrapper {
            @apply flex justify-between mt-2;
            .widget-list-title {
                font-size: 0.875rem;
            }
        }
        .widgets-list {
            @apply mt-2 pl-6;
            li {
                @apply text-gray-700;
                list-style-type: disc;
                font-size: 0.875rem;
                line-height: 1.25;
                &.text-more {
                    list-style-type: none;
                    margin-left: -1.5rem;
                }
            }
        }
    }
}

</style>
