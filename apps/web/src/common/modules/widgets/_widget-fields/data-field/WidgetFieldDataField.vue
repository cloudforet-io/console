<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import { getInitialSelectedMenuItem } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { DataFieldOptions } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<DataFieldOptions, string|string[]>>(), {
    widgetFieldSchema: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<string | string[]>>();
const state = reactive({
    isInitiated: false,
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
        if (props.widgetFieldSchema?.options?.multiSelectable) {
            return Array.isArray(state.selectedItem) && !!state.selectedItem?.length;
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

const initValue = () => {
    if (state.multiselectable) {
        if (state.proxyValue && !Array.isArray(state.proxyValue)) state.proxyValue = [state.proxyValue];
        state.selectedItem = convertToMenuItem(state.proxyValue ?? []);
    } else {
        state.selectedItem = state.proxyValue;
    }
};
watch(() => state.menuItems, (menuItems) => {
    if (!state.isInitiated) {
        initValue();
        state.isInitiated = true;
    }

    if (!menuItems?.length) return;

    if (state.multiselectable) {
        if (state.proxyValue && !Array.isArray(state.proxyValue)) state.proxyValue = [state.proxyValue];
        state.proxyValue = getInitialSelectedMenuItem(menuItems, state.proxyValue ?? []);
        state.selectedItem = convertToMenuItem(state.proxyValue ?? []);
    } else {
        state.proxyValue = getInitialSelectedMenuItem(menuItems, state.proxyValue);
        state.selectedItem = state.proxyValue ?? state.menuItems[0]?.name;
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
                               :show-select-marker="state.multiselectable"
                               :invalid="!state.isValid"
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
