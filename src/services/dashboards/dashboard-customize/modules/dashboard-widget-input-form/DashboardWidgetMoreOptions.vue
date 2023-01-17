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
                        :selected.sync="selectedOptions"
                        :style="contextMenuStyle"
                        use-fixed-menu-style
                        multi-selectable
                        item-height-fixed
                        show-select-marker
                        @select="handleSelectOption"
        />
    </div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { isEmpty } from 'lodash';


import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface InheritState {
    [propertyName: string]: boolean
}

const props = withDefaults(defineProps<{
    widgetConfigId?: string;
    inheritState?: InheritState;
}>(), {
    widgetConfigId: undefined,
    inheritState: () => ({}),
});

const emit = defineEmits<{(e: 'add-schema-property', propertyName: string): void,
    (e: 'remove-schema-property', propertyName: string): void}>();

const state = reactive({
    widgetConfig: computed(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
    requiredProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.schema?.required ?? []),
});
const targetRef = ref<any|null>(null);
const contextMenuRef = ref<any|null>(null);
const optionsMenuItems = computed<MenuItem[]>(() => {
    const menuItems: MenuItem[] = [];
    const schemaProperties = state.widgetConfig?.options_schema?.schema.properties;
    if (isEmpty(schemaProperties)) return [];
    Object.entries(schemaProperties).forEach(([key, val]) => {
        if (!state.requiredProperties.includes(key)) {
            menuItems.push({ name: key, label: (val as JsonSchema).title });
        }
    });
    return menuItems;
});
const selectedOptions = ref<MenuItem[]>([]);
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

const handleSelectOption = (item) => {
    const propertyName = item.name;
    if (selectedOptions.value.find((d) => d.name === propertyName)) {
        emit('add-schema-property', propertyName);
    } else {
        emit('remove-schema-property', propertyName);
    }
    hideContextMenu();
};
const handleClickAddOptions = () => {
    initiateMenu();
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};
const getRefinedSelectedOptions = () => {
    const defaultProperties = state.widgetConfig.options_schema?.default_properties ?? [];
    return optionsMenuItems.value.filter((d) => {
        if (props.inheritState[d.name]) return true;
        return !state.requiredProperties.includes(d.name) && defaultProperties.includes(d.name);
    });
};

watch(() => props.widgetConfigId, () => {
    selectedOptions.value = getRefinedSelectedOptions();
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.dashboard-widget-more-options {
    position: relative;
    display: inline-block;
}
</style>
