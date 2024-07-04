<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    getInitialSelectedMenuItem,
} from '@/common/modules/widgets/_helpers/widget-field-helper';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    DataFieldOptions,
} from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<DataFieldOptions>>(), {
    widgetFieldSchema: () => ({}),
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
    const _value = getInitialSelectedMenuItem(menuItems, state.proxyValue);
    state.proxyValue = _value;
    if (state.multiselectable) {
        state.selectedItem = convertToMenuItem(_value);
    } else {
        state.selectedItem = _value;
    }
}, { immediate: true });
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
