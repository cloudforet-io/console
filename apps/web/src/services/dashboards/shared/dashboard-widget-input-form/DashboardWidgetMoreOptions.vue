<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import { chain, isEqual } from 'lodash';

import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type { WidgetOptionsSchemaProperty } from '@/services/dashboards/widgets/_configs/widget-options-schema';

interface MenuItem {
    name: string;
    label: string;
}

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    propertySchemaTuples: computed<[optionKey: string, schema: WidgetOptionsSchemaProperty][]>(() => {
        const properties = widgetFormGetters.widgetConfig?.options_schema?.properties ?? {};
        return Object.entries(properties);
    }),
});

/* refs */
const targetRef = ref<any|null>(null);
const contextMenuRef = ref<any|null>(null);
const selectedOptions = ref<MenuItem[]>([]);
const optionsMenuItems = computed<MenuItem[]>(() => state.propertySchemaTuples.map(([optionKey, config]) => ({
    name: optionKey,
    label: config.name ?? optionKey,
})));

/* context menu controller */
const {
    visibleMenu: visibleContextMenu,
    refinedMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
    initiateMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    selected: selectedOptions,
    menu: optionsMenuItems,
});

const handleUpdateSelectedOptions = (selected: MenuItem[]) => {
    const order = widgetFormGetters.widgetConfig?.options_schema?.order ?? [];
    const schemaProperties = widgetFormGetters.widgetConfig?.options_schema?.properties ?? {};
    const selectedProperties: string[] = chain(selected)
        .map((item) => item.name)
        .sortBy((optionKey) => {
            const idx = order.indexOf(optionKey);
            if (idx < 0) return 9999;
            if (schemaProperties[optionKey]?.fixed) return idx;
            return 1000 + idx;
        })
        .value();
    widgetFormStore.updateSchemaProperties(selectedProperties);
    hideContextMenu();
};
const handleClickAddOptions = () => {
    initiateMenu();
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};

watch(() => widgetFormState.schemaProperties, (selectedProperties) => {
    const current = selectedOptions.value.map((item) => item.name);
    if (isEqual(current, selectedProperties)) return;

    const refined: MenuItem[] = selectedProperties.map((d) => {
        const config = widgetFormGetters.widgetConfig?.options_schema?.properties?.[d];
        return { name: d, label: config?.name ?? d };
    });
    selectedOptions.value = refined;
}, { immediate: true });

</script>

<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-widget-more-options"
    >
        <p-button ref="targetRef"
                  style-type="secondary"
                  icon-left="ic_plus_bold"
                  block
                  @click="handleClickAddOptions"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.ADD_OPTIONS') }}
        </p-button>
        <p-context-menu v-show="visibleContextMenu"
                        ref="contextMenuRef"
                        :menu="refinedMenu"
                        :selected="selectedOptions"
                        :style="contextMenuStyle"
                        use-fixed-menu-style
                        multi-selectable
                        item-height-fixed
                        show-select-marker
                        :reset-selected-on-unmounted="false"
                        @update:selected="handleUpdateSelectedOptions"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-widget-more-options {
    position: relative;
    display: inline-block;
}
</style>
