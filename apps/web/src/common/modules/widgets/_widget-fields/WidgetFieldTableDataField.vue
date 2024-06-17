<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PSelectButton, PTooltip, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps, TableDataFieldOptions } from '@/common/modules/widgets/types/widget-field-type';
import type { TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';

const DEFAULT_COUNT = 5;
const props = withDefaults(defineProps<WidgetFieldComponentProps<TableDataFieldOptions>>(), {
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
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = state.selectedFieldType === 'staticField' ? 'data_info' : 'labels_info';
        if (!props.dataTable) return [];
        const dataInfoList = Object.keys(props.dataTable[dataTarget] ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    isValid: computed<boolean>(() => {
        if (!state.proxyValue?.count) return false;
        if (state.selectedFieldType === 'staticField' && !state.proxyValue?.value?.length) return false;
        return !!state.proxyValue?.value;
    }),
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? (state.proxyValue?.count <= state.max) : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
});

/* Event */
const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
    state.proxyValue = { ...state.proxyValue, value: state.menuItems[0]?.name, fieldType: value };
};
const handleUpdateValue = (val: string|MenuItem[]) => {
    state.proxyValue = { ...state.proxyValue, value: val };
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue?.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

/* Init */
onMounted(() => {
    state.proxyValue = {
        value: props.value?.value ?? state.menuItems[0]?.name,
        count: props.value?.count ?? props.widgetFieldSchema?.options?.default ?? DEFAULT_COUNT,
    };
    state.selectedFieldType = props.value?.fieldType ?? 'dynamicField';
});
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
                <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                               style-type="secondary"
                               required
                               class="w-full"
                >
                    <p-select-dropdown :menu="state.menuItems"
                                       :selected="state.proxyValue?.value"
                                       :multi-selectable="state.selectedFieldType === 'staticField'"
                                       show-select-marker
                                       appearance-type="badge"
                                       @update:selected="handleUpdateValue"
                    />
                </p-field-group>
                <p-field-group :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
                               style-type="secondary"
                               class="max-items"
                               :invalid="!state.isMaxValid"
                               :invalid-text="$t('COMMON.WIDGETS.NUMBER_FIELD_VALIDATION', {max: state.max})"
                               required
                >
                    <p-text-input type="number"
                                  :min="1"
                                  :max="props.widgetFieldSchema?.options?.max"
                                  :invalid="!state.isMaxValid"
                                  :value="state.proxyValue?.count ?? DEFAULT_COUNT"
                                  @update:value="handleUpdateCount"
                    />
                    <template #label-extra>
                        <p-tooltip v-if="state.max"
                                   :contents="state.tooltipDesc"
                                   position="bottom"
                                   class="tooltip"
                        >
                            <p-i width="1rem"
                                 height="1rem"
                                 name="ic_info-circle"
                                 class="icon"
                            />
                        </p-tooltip>
                    </template>
                </p-field-group>
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
