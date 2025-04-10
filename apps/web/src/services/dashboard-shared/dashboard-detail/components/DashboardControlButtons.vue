<script setup lang="ts">
import { reactive } from 'vue';

import { PButton } from '@cloudforet/mirinae';

import { useDisplayStore } from '@/store/display/display-store';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';


const widgetGenerateStore = useWidgetGenerateStore();
const displayStore = useDisplayStore();
const state = reactive({
    loading: false,
});

/* Event */
const handleAddWidget = async () => {
    state.loading = true;
    widgetGenerateStore.setOverlayType('ADD');
    widgetGenerateStore.setShowOverlay(true);
    state.loading = false;
};
const handleClickWidgetReorder = () => {
    if (displayStore.state.visibleSidebar) {
        displayStore.setVisibleSidebar(false);
    } else {
        displayStore.showWidget();
    }
};
</script>

<template>
    <div class="dashboard-control-buttons">
        <p-button :icon-left="displayStore.state.visibleSidebar ? 'ic_check' : 'ic_edit'"
                  :style-type="displayStore.state.visibleSidebar ? 'substitutive' : 'tertiary'"
                  size="sm"
                  :disabled="displayStore.state.visibleSidebar"
                  @click="handleClickWidgetReorder"
        >
            {{ $t('DASHBOARDS.DETAIL.EDIT_LAYOUT') }}
        </p-button>
        <p-button icon-left="ic_plus"
                  style-type="secondary"
                  size="sm"
                  :loading="state.loading"
                  @click="handleAddWidget"
        >
            {{ $t('DASHBOARDS.DETAIL.ADD_WIDGET') }}
        </p-button>
    </div>
</template>

<style lang="postcss">
.dashboard-control-buttons {
    @apply flex justify-end items-center;
    gap: 0.5rem;
    height: 2rem;
}
</style>
