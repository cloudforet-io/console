<script setup lang="ts">
import { reactive } from 'vue';

import { PButton } from '@spaceone/design-system';

import { store } from '@/store';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';


const widgetGenerateStore = useWidgetGenerateStore();
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
    if (store.state.display.visibleSidebar) {
        store.dispatch('display/hideSidebar');
    } else {
        store.dispatch('display/showWidget');
    }
};
</script>

<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="ic_plus"
                  style-type="tertiary"
                  size="sm"
                  :loading="state.loading"
                  @click="handleAddWidget"
        >
            {{ $t('DASHBOARDS.DETAIL.ADD_WIDGET') }}
        </p-button>
        <p-button :icon-left="store.state.display.visibleSidebar ? 'ic_check' : 'ic_edit'"
                  :style-type="store.state.display.visibleSidebar ? 'substitutive' : 'tertiary'"
                  size="sm"
                  @click="handleClickWidgetReorder"
        >
            {{ store.state.display.visibleSidebar ? $t('DASHBOARDS.DETAIL.DONE_EDITING') : $t('DASHBOARDS.DETAIL.EDIT_LAYOUT') }}
        </p-button>
    </div>
</template>

<style lang="postcss">
.dashboard-control-buttons {
    @apply flex justify-end;
    gap: 0.75rem;
}
</style>
