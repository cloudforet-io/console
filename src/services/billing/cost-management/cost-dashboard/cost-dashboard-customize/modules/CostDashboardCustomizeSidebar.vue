<template>
    <div>
        <portal to="info-title">
            <span class="sidebar-title">Customize Dashboard</span> <br>
        </portal>
        <portal to="info-contents">
            <div class="sidebar-contents">
                <span class="sidebar-desc">You can add, move and <br> remove your widgets.</span>
                <p-icon-text-button style-type="primary-dark" name="ic_plus_bold" :outline="true"
                                    class="add-widget-button" @click="handleClickAddWidget"
                >
                    Add Widget
                </p-icon-text-button>
                <span class="widget-count">Widget</span>
                <draggable v-model="widgetList" tag="ul" class="widget-list"
                           ghost-class="ghost"
                >
                    <li
                        v-for="(widget, idx) in widgetList"
                        :key="idx"
                        class="widget-item"
                    >
                        <p-i name="ic_drag-handle" width="1rem" height="1rem"
                             class="drag-icon"
                        />
                        <span v-for="{ name, widget_id } in widget" :key="widget_id">
                            {{ name }} <br>
                        </span>
                        <p-divider class="w-full" />
                    </li>
                </draggable>
            </div>
        </portal>
        <cost-dashboard-customize-widget-modal v-model="customizeModalVisible" @confirm="$emit('add-widget',$event)" />
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';

import { PIconTextButton, PI, PDivider } from '@spaceone/design-system';
import {
    onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import CostDashboardCustomizeWidgetModal
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetModal.vue';

export default {
    name: 'CostDashboardCustomizeSidebar',
    components: {
        CostDashboardCustomizeWidgetModal,
        PI,
        PIconTextButton,
        PDivider,
        draggable,
    },

    setup() {
        const state = reactive({
            widgetList: [[{
                widget_id: 'MonthToDateSpend',
                name: 'Month-To-Date Spend',
            }, {
                widget_id: 'LastMonthTotalSpend',
                name: 'Last Month Total Spending',
            }, {
                widget_id: 'BudgetUsage',
                name: 'Budget Usage',
            }],
            [{
                widget_id: 'CostByProject',
                name: 'Cost by Project',
            }],
            [{
                widget_id: 'CostTrendByProject',
                name: 'Cost Trend By Project',
            }],
            ],
            customizeModalVisible: false,
        });

        const handleClickAddWidget = () => {
            state.customizeModalVisible = true;
            store.commit('service/costDashboard/setWidgetPosition', undefined);
            store.commit('service/costDashboard/setLayoutOfSpace', undefined);
        };

        onUnmounted(() => {
            store.dispatch('display/hideSidebar');
        });
        return {
            ...toRefs(state),
            handleClickAddWidget,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-title {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    line-height: 125%;
}

.sidebar-contents {
    @apply flex flex-col;
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;
    .sidebar-desc {
        @apply text-gray-600;
    }
    .add-widget-button {
        display: block;
    }
    .widget-count {
        @apply font-bold;
    }
}
</style>
