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
    selectedItem: undefined as undefined | MenuItem[] | string,
    multiSelectable: computed(() => state.selectedFieldType === 'staticField'),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = state.multiSelectable ? 'data_info' : 'labels_info';
        if (!props.dataTable) return [];
        const dataInfoList = Object.keys(props.dataTable[dataTarget] ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    isValid: computed<boolean>(() => {
        if (state.proxyValue?.count === undefined) return false;
        if (state.menuItems.length === 0) return false;
        if (Array.isArray(state.selectedItem)) {
            return !!state.selectedItem.length;
        }
        return !!state.selectedItem;
    }),
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? (state.proxyValue?.count <= state.max) && !!state.proxyValue?.count : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
});

/* Event */
const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[0]?.name,
        };
        state.selectedItem = convertToMenuItem([state.menuItems[0].name]);
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[0]?.name,
        };
        state.selectedItem = state.menuItems[0]?.name;
    }
    state.proxyValue = { ...state.proxyValue, value: state.menuItems[0]?.name, fieldType: value };
};
const handleUpdateValue = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (Array.isArray(val)) {
        state.proxyValue = {
            ...state.proxyValue,
            value: val.map((item) => item?.name),
        };
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: val,
        };
    }
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue?.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});
const isIncludedInMenuItems = (data: string[]|string):boolean => {
    if (Array.isArray(data)) {
        return data.every((d) => state.menuItems.some((m) => m?.name === d));
    }
    return state.menuItems.some((m) => m?.name === data);
};
const convertToMenuItem = (data: string[]) => data.map((d) => ({
    name: d,
    label: d,
}));
/* Init */
onMounted(() => {
    state.selectedFieldType = props.value?.fieldType ?? 'dynamicField';
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            value: isIncludedInMenuItems(state.proxyValue?.value) ? state.proxyValue?.value : [state.menuItems[0]?.name],
        };
        state.selectedItem = convertToMenuItem(state.proxyValue?.value);
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: isIncludedInMenuItems(state.proxyValue?.value) ? state.proxyValue?.value : state.menuItems[0]?.name,

        };
        state.selectedItem = state.menuItems[0]?.name;
    }
    state.proxyValue = {
        ...state.proxyValue,
        count: props.value?.count ?? DEFAULT_COUNT,
    };
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
                                       :selected="state.selectedItem"
                                       :multi-selectable="state.multiSelectable"
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

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>