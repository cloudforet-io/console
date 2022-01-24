<template>
    <div>
        <h3>Start a new template</h3>
        <div v-for="(layoutData, idx) in defaultLayoutData" :key="layoutData.name">
            <p-select-card
                :selected="selectedTemplate"
                :value="layoutData"
                block
                @change="handleLayoutChange"
            >
                {{ layoutData.name }}
            </p-select-card>
            <p v-if="layoutData.widgetList.length">
                <span>List of widgets</span>
                <p-collapsible-toggle :is-collapsed="!unfoldedIndices.includes(idx)"
                                      @update:isCollapsed="handleUpdateCollapsed(idx, ...arguments)"
                />
                <template v-if="unfoldedIndices.includes(idx)">
                    <span v-for="({name}) in getNamesOfWidgetList(layoutData.widgetList)" :key="name">
                        {{ name }} <br>
                    </span>
                </template>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PCollapsibleToggle, PSelectCard,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { flattenDeep } from 'lodash';
import { defaultLayoutData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import { DefaultLayout, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';

const getNamesOfWidgetList = (widgetList) => {
    const flattenWidgetList: WidgetInfo[] = flattenDeep(widgetList);
    if (flattenWidgetList) return flattenWidgetList.map<Pick<WidgetInfo, 'name'>>(d => ({ name: d.name }));
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
            selectedTemplate: computed(() => store.state.service?.costDashboardCreate?.selectedTemplate),
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
            store.commit('service/costDashboardCreate/setDashboardTemplate', value);
            store.commit('service/costDashboardCreate/setDefaultFilter', {});
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
