<template>
    <base-trend-widget ref="widgetRef"
                       v-bind="$props"
    >
        <template #header-right>
            <widget-frame-header-dropdown :items="state.items"
                                          :selected="state.selected"
                                          @select="handleSelect"
            />
        </template>
    </base-trend-widget>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, reactive, ref, toRefs,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import BaseTrendWidget from '@/services/dashboards/widgets/_base/base-trend/BaseTrendWidget.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';

const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState(props)),
    items: computed<MenuItem[]>(() => ([
        { type: 'item', name: 'cost', label: 'Cost' }, // TODO: i18n?
        { type: 'item', name: 'size', label: 'Size' },
    ])),
    selected: 'cost',
});
const widgetRef = ref<any>(null);

const refreshWidget = () => {
    if (widgetRef.value) widgetRef.value.refreshWidget();
};
const handleSelect = (selected) => {
    if (state.selected !== selected) {
        state.selected = selected;
        refreshWidget();
    }
};

defineExpose({
    refreshWidget,
});
</script>
