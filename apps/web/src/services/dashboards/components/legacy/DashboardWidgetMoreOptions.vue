<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { chain, cloneDeep, isEqual } from 'lodash';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/inputs/context-menu/type';

import type { WidgetOptionsSchemaProperty } from '@/schema/dashboard/_types/widget-type';

import { useWidgetFormStore } from '@/services/dashboards/stores/widget-form-store';


const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    propertySchemaTuples: computed<[optionKey: string, schema: WidgetOptionsSchemaProperty][]>(() => {
        const properties = widgetFormGetters.widgetConfig?.options_schema?.properties ?? {};
        return Object.entries(properties);
    }),
    widgetOptionMenuItems: computed<MenuItem[]>(() => {
        const _refinedMenu: MenuItem[] = [];
        refinedMenu.value.forEach((d) => {
            const schemaProperty = widgetFormGetters.widgetConfig?.options_schema?.properties?.[d.name];
            if (schemaProperty?.hidden) return;
            if (schemaProperty?.fixed || schemaProperty?.readonly) {
                _refinedMenu.push({ ...d, disabled: true });
                return;
            }
            _refinedMenu.push(d);
        });
        return _refinedMenu;
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

const handleSelectWidgetOption = (selected: MenuItem, index: number, isSelected: boolean) => {
    // only manage delete case
    if (!isSelected) {
        const _widgetOptions = cloneDeep(widgetFormState.widgetOptions);
        const propertyName = selected.name as string;
        const dataName = propertyName.replace('filters.', '');
        if (propertyName.startsWith('filters.')) {
            delete _widgetOptions.filters?.[dataName];
        } else {
            delete _widgetOptions[propertyName];
        }
        widgetFormStore.updateOptions(_widgetOptions);
    }
};
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
                        class="more-context-menu"
                        :menu="state.widgetOptionMenuItems"
                        :selected="selectedOptions"
                        use-fixed-menu-style
                        multi-selectable
                        item-height-fixed
                        show-select-marker
                        :reset-selected-on-unmounted="false"
                        @select="handleSelectWidgetOption"
                        @update:selected="handleUpdateSelectedOptions"
        />
    </div>
</template>

<style lang="postcss" scoped>
.more-context-menu {
    z-index: 1000;
}
</style>

