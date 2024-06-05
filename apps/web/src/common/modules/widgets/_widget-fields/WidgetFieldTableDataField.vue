<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PSelectButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import type {
    TableDataFieldOptions,
} from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<TableDataFieldOptions>>(), {
    widgetFieldSchema: () => ({}),
});

const state = reactive({
    selectButtonItems: computed<MenuItem[]>(() => props.widgetFieldSchema.options?.fields?.map((field) => ({
        name: field.name,
        label: i18n.t(field.labelTranslationCode || field.name),
    }))),
    selectedItem: undefined as string | undefined,
    selectedDataField: computed(() => props.widgetFieldSchema.options?.fields?.find((field) => field.name === state.selectedItem)),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});

/* Event */
const handleChangeDataFieldType = (value: string) => {
    state.selectedItem = value;
};

onMounted(() => {
    state.selectedItem = state.selectButtonItems[0]?.name;
});
</script>

<template>
    <div class="widget-field-table-data-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_FIELD')"
                       required
        >
            <div class="data-field-type-select-wrapper">
                <p-select-button v-for="selectItem in state.selectButtonItems"
                                 :key="`select-button-${selectItem.name}`"
                                 :value="selectItem.name"
                                 style-type="secondary"
                                 :selected="state.selectedItem"
                                 @change="handleChangeDataFieldType"
                >
                    {{ selectItem.label }}
                </p-select-button>
            </div>
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems"
                                   :multi-selectable="state.selectedDataField?.multiSelectable"
                />
                <p-text-input type="number"
                              :min="0"
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
