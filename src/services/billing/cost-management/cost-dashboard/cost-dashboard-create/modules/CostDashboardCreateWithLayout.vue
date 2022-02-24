<template>
    <fragment>
        <h3 class="pt-0">
            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.BASIC_TEMPLATE') }}
        </h3>
        <div class="grid grid-cols-4 col-gap-2 mb-2">
            <div v-for="(layoutData, idx) in defaultLayoutData" :key="layoutData.name" class="mb-4">
                <p-select-card
                    :selected="selectedTemplate"
                    :value="layoutData"
                    block
                    @change="handleLayoutChange"
                >
                    {{ layoutData.name }}
                </p-select-card>
                <div v-if="layoutData.widgetList.length">
                    <div class="flex justify-between mt-2">
                        <span class="widget-list-title">List of widgets</span>
                        <p-collapsible-toggle :is-collapsed="!unfoldedIndices.includes(idx)"
                                              toggle-position="contents"
                                              @update:isCollapsed="handleUpdateCollapsed(idx, ...arguments)"
                        />
                    </div>
                    <ul v-if="unfoldedIndices.includes(idx)" class="widgets-list">
                        <li v-for="({name}) in getNamesOfWidgetList(layoutData.widgetList)" :key="name">
                            {{ name }}
                        </li>
                        <li class="text-more">
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.AND_MORE') }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </fragment>
</template>

<script lang="ts">
import {
    PCollapsibleToggle, PSelectCard,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { flattenDeep, startCase } from 'lodash';
import { defaultLayoutData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import { DefaultLayout, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';

const getNamesOfWidgetList = (widgetList) => {
    const flattenWidgetList: WidgetInfo[] = flattenDeep(widgetList);
    if (flattenWidgetList) return flattenWidgetList.map(d => ({ name: startCase(defaultWidgetMap[d.widget_id].widget_file_name) }));
    return [];
};

export default {
    name: 'CostDashboardCreateWithLayout',
    components: {
        PSelectCard,
        PCollapsibleToggle,
    },

    setup() {
        const state = reactive({
            selectedLayout: {} as Record<string, DefaultLayout>,
            selectedTemplate: computed(() => store.state.service?.costDashboard?.selectedTemplate),
            unfoldedIndices: [] as number[],
        });

        const handleUpdateCollapsed = (idx: number, isCollapsed: boolean) => {
            const foundIdx = state.unfoldedIndices.findIndex(d => d === idx);
            if (isCollapsed) {
                if (foundIdx !== -1) {
                    state.unfoldedIndices.splice(foundIdx, 1);
                }
            } else if (foundIdx === -1) {
                state.unfoldedIndices.push(idx);
            }
        };

        const handleLayoutChange = (value: Record<string, DefaultLayout>) => {
            store.commit('service/costDashboard/setDashboardTemplate', value);
            store.commit('service/costDashboard/setDefaultFilter', {});
        };

        return {
            ...toRefs(state),
            defaultLayoutData,
            handleUpdateCollapsed,
            handleLayoutChange,
            getNamesOfWidgetList,
        };
    },
};
</script>
<style lang="postcss" scoped>
.widget-list-title {
    font-size: 0.875rem;
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
</style>
