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
                        @update:selected="handleUpdateSelectedOptions"
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
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { isEmpty, isEqual, union } from 'lodash';

import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface MenuItem {
    name: string;
    label: string;
}

const props = withDefaults(defineProps<{
    widgetConfigId?: string;
    selectedProperties?: string[];
}>(), {
    widgetConfigId: undefined,
    selectedProperties: () => [],
});

const emit = defineEmits<{(e: 'update:selected-properties', properties: string[]): void}>();

const state = reactive({
    widgetConfig: computed(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
    requiredProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.schema?.required ?? []),
    defaultProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.default_properties ?? []),
    propertiesOrder: computed<string[]>(() => state.widgetConfig?.options_schema?.schema?.order ?? []),
    allProperties: computed<string[]>(() => Object.keys(state.widgetConfig?.options_schema?.schema.properties ?? {})),
    schemaProperties: computed<JsonSchema['properties']>(() => state.widgetConfig?.options_schema?.schema?.properties ?? {}),
    defaultIdxMap: computed<Record<string, number>>(() => {
        const defaultIdxMap = {};
        state.defaultProperties.forEach((name, idx) => { defaultIdxMap[name] = idx; });
        return defaultIdxMap;
    }),
    orderIdxMap: computed<Record<string, number>>(() => {
        const orderIdxMap = {};
        state.propertiesOrder.forEach((name, idx) => { orderIdxMap[name] = idx; });
        return orderIdxMap;
    }),
});

/* sort */
const sortItems = (items: MenuItem[]) => items.sort((a, b) => {
    if (state.orderIdxMap[a.name] !== undefined) {
        // if both are in order array, follow order array
        if (state.orderIdxMap[b.name] !== undefined) return state.orderIdxMap[a.name] > state.orderIdxMap[b.name] ? 1 : -1;
        // otherwise, the item in order array comes before
        return -1;
    }

    // if both are not in order array
    if (state.defaultIdxMap[a.name] !== undefined) {
        // if both are default, follow default index order
        if (state.defaultIdxMap[b.name] !== undefined) return state.defaultIdxMap[a.name] > state.defaultIdxMap[b.name] ? 1 : -1;
        // otherwise, default item comes before
        return -1;
    }
    // otherwise, sort by alphabetical
    return a.label > b.label ? 1 : -1;
});

/* refs */
const targetRef = ref<any|null>(null);
const contextMenuRef = ref<any|null>(null);
const selectedOptions = ref<MenuItem[]>([]);
const optionsMenuItems = computed<MenuItem[]>(() => {
    const menuItems: MenuItem[] = [];
    if (isEmpty(state.schemaProperties)) return [];

    Object.entries<JsonSchema>(state.schemaProperties).forEach(([key, val]) => {
        if (!state.requiredProperties.includes(key)) {
            menuItems.push({ name: key, label: val.title ?? key });
        }
    });

    return sortItems(menuItems);
});

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
    const selectedProperties: string[] = union(state.requiredProperties, sortItems(selected).map((item) => item.name));
    emit('update:selected-properties', selectedProperties);
    hideContextMenu();
};
const handleClickAddOptions = () => {
    initiateMenu();
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};

watch(() => props.selectedProperties, (selectedProperties) => {
    const current = selectedOptions.value.map((item) => item.name);
    if (isEqual(current, selectedProperties)) return;

    const refined: MenuItem[] = selectedProperties.filter((d) => !state.requiredProperties.includes(d))
        .map((d) => ({ name: d, label: state.schemaProperties[d]?.title ?? d }));
    selectedOptions.value = refined;
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.dashboard-widget-more-options {
    position: relative;
    display: inline-block;
}
</style>
