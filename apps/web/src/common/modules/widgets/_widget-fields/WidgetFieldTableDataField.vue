<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PSelectButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';
import type { TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<undefined>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<TableDataFieldValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    fieldTypeMenuItems: computed<MenuItem[]>(() => [
        {
            name: 'dynamicField',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DYNAMIC_FIELD'),
        },
        {
            name: 'staticField',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.STATIC_FIELD'),
        },
    ]),
    selectedFieldType: 'dynamicField',
    selectedItem: undefined as undefined | MenuItem[] | string,
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});

/* Event */
const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
};
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    const _val = Array.isArray(val) ? val.map((item) => item.name) : val;
    state.proxyValue = { ...state.proxyValue, value: _val };
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

</script>

<template>
    <div class="widget-field-table-data-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_FIELD')"
                       required
        >
            <div class="data-field-type-select-wrapper">
                <p-select-button v-for="selectItem in state.fieldTypeMenuItems"
                                 :key="`select-button-${selectItem.name}`"
                                 :value="selectItem.name"
                                 style-type="secondary"
                                 :selected="state.selectedFieldType"
                                 @change="handleChangeDataFieldType"
                >
                    {{ selectItem.label }}
                </p-select-button>
            </div>
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems"
                                   :multi-selectable="state.selectedFieldType === 'staticField'"
                                   show-select-marker
                                   appearance-type="badge"
                                   :selected="state.selectedItem"
                                   @update:selected="handleUpdateSelect"
                />
                <p-text-input type="number"
                              :min="0"
                              @update:value="handleUpdateCount"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.data-field-type-select-wrapper {
    display: flex;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
}
.field-form-wrapper {
    display: flex;
    gap: 0.5rem;
    .p-select-dropdown {
        width: 100%;
    }

    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 6.5rem;
        .input-container {
            padding-right: 1.5rem;
        }
    }
}
</style>
