<template>
    <div>
        <portal to="widget-title">
            <span class="sidebar-title">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CUSTOMIZE_TITLE') }}</span> <br>
        </portal>
        <portal to="widget-contents">
            <div class="sidebar-contents">
                <p class="sidebar-desc">
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.SIDEBAR_DESC') }}
                </p>
                <p-icon-text-button style-type="primary-dark" name="ic_plus_bold" :outline="true"
                                    size="lg"
                                    class="add-widget-button" @click="handleClickAddWidget"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET') }}
                </p-icon-text-button>
                <p class="widget-count">
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CURRENT_WIDGETS') }}
                </p>
                <draggable v-model="editingCustomLayout" tag="ul" class="widget-list"
                           ghost-class="ghost"
                >
                    <li
                        v-for="(widget, idx) in editingCustomLayout"
                        :key="idx"
                        class="widget-item"
                    >
                        <p-i name="ic_drag-handle" width="1rem" height="1rem"
                             class="drag-icon"
                        />
                        <div class="widget-row">
                            <span v-for="{ name, widget_id } in widget" :key="`${widget_id}-${getUUID()}`" class="widget-col">
                                {{ name }}
                            </span>
                        </div>
                    </li>
                </draggable>
            </div>
        </portal>
        <cost-dashboard-customize-widget-modal v-model="customizeModalVisible" @confirm="$emit('add-widget',$event)" />
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';

import { PIconTextButton, PI } from '@spaceone/design-system';
import {
    computed,
    onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import CostDashboardCustomizeWidgetModal
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetModal.vue';
import { CustomLayout } from '@/services/cost-explorer/cost-dashboard/type';
import { getUUID } from '@/lib/component-util/getUUID';
import { costExplorerStore } from '@/services/cost-explorer/store';

export default {
    name: 'CostDashboardCustomizeSidebar',
    components: {
        CostDashboardCustomizeWidgetModal,
        PI,
        PIconTextButton,
        draggable,
    },

    setup() {
        const state = reactive({
            customizeModalVisible: false,
            editingCustomLayout: computed<CustomLayout[]|undefined>({
                get() { return costExplorerStore.state.dashboard.editedCustomLayout; },
                set(val) {
                    costExplorerStore.commit('dashboard/setEditedCustomLayout', [...(val || [])]);
                },
            }),
        });

        const handleClickAddWidget = () => {
            state.customizeModalVisible = true;
            costExplorerStore.commit('dashboard/setWidgetPosition', undefined);
            costExplorerStore.commit('dashboard/setLayoutOfSpace', undefined);
        };

        onUnmounted(() => {
            store.dispatch('display/hideSidebar');
        });
        return {
            ...toRefs(state),
            handleClickAddWidget,
            getUUID,
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
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;
    .sidebar-desc {
        @apply text-gray-600;
        width: 12.75rem;
    }
    .add-widget-button {
        @apply block mt-6 mb-6;
    }
    .widget-count {
        @apply mb-2 font-bold;
    }
    .widget-item {
        @apply flex items-center pt-2 pb-2 border-b border-gray-200;
        .drag-icon {
            @apply flex-shrink-0 mr-2;
        }
        .widget-row {
            @apply flex flex-col truncate;
            row-gap: 0.1875rem;
            .widget-col {
                @apply truncate;
            }
        }
    }
}
</style>
