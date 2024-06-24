<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    DataFieldOptions,
} from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<DataFieldOptions>>(), {
    widgetFieldSchema: () => ({}),
    value: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<string | string[]>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    menuItems: computed<MenuItem[]>(() => {
        const dataInfoList = Object.keys(props.dataTable?.data_info ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    selectedItem: undefined as undefined | MenuItem[] | string,
    isValid: computed<boolean>(() => {
        if (state.menuItems.length === 0) return false;
        if (Array.isArray(state.selectedItem)) {
            return !!state.selectedItem.length;
        }
        return !!state.selectedItem;
    }),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (Array.isArray(val)) {
        state.proxyValue = val.map((item) => item.name);
    } else {
        state.proxyValue = val;
    }
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });


const convertToMenuItem = (data: string[]|string) => {
    if (Array.isArray(data)) {
        return data.map((d) => ({
            name: d,
            label: d,
        }));
    }
    return {
        name: data,
        label: data,
    };
};

watch(() => state.menuItems, (menuItems) => {
    const isIncludedInMenuItems = (data: string[]|string):boolean => {
        if (Array.isArray(data)) {
            return data.every((d) => menuItems.some((m) => m.name === d));
        }
        return menuItems.some((m) => m.name === data);
    };
    if (state.multiselectable) {
        state.proxyValue = isIncludedInMenuItems(state.proxyValue) ? state.proxyValue : [state.menuItems[0]?.name];
        state.selectedItem = convertToMenuItem(state.proxyValue);
    } else {
        state.proxyValue = isIncludedInMenuItems(state.proxyValue) ? state.proxyValue : state.menuItems[0]?.name;
        state.selectedItem = state.proxyValue?.value ?? state.menuItems[0]?.name;
    }
}, { immediate: true });

onMounted(() => {
    if (state.multiselectable) {
        state.proxyValue = props.value ?? [state.menuItems[0]?.name];
        state.selectedItem = convertToMenuItem(state.proxyValue);
    } else {
        state.proxyValue = props.value ?? state.menuItems[0]?.name;
        state.selectedItem = state.proxyValue?.value ?? state.menuItems[0]?.name;
    }
});

</script>

<template>
    <div class="widget-field-data-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_FIELD')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.selectedItem"
                               :multi-selectable="state.multiselectable"
                               show-select-marker
                               appearance-type="badge"
                               @update:selected="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
