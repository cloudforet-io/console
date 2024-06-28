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
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps, TableDataFieldOptions } from '@/common/modules/widgets/types/widget-field-type';
import type { TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';

const DEFAULT_COUNT = 5;
const DEFAULT_FIELD_TYPE = 'staticField';
const props = withDefaults(defineProps<WidgetFieldComponentProps<TableDataFieldOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<TableDataFieldValue>>();

const { labelsMenuItem } = useGranularityMenuItem(props, 'tableDataField');
const MIN_LABELS_INFO_COUNT = 2;
const DEFAULT_INDEX = 1;
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
    selectedFieldType: DEFAULT_FIELD_TYPE,
    selectedItem: undefined as undefined | MenuItem[] | string,
    selectedCriteria: undefined as undefined | MenuItem[] | string,
    multiSelectable: computed(() => state.selectedFieldType === 'staticField'),
    menuItems: computed<MenuItem[]>(() => {
        if (!props.dataTable) return [];
        return state.selectedFieldType === 'dynamicField' ? labelsMenuItem.value : state.dataInfoMenuItems;
    }),
    dataInfoMenuItems: computed<MenuItem[]>(() => sortWidgetTableFields(Object.keys(props.dataTable?.data_info ?? {})).map((d) => ({
        name: d,
        label: d,
    }))),
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
const handleUpdateCriteria = (val: string|MenuItem[]) => {
    state.selectedCriteria = val;
    state.proxyValue = {
        ...state.proxyValue,
        criteria: val,
    };
};
const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            value: [state.menuItems[0]?.name],
            criteria: undefined,
        };
        state.selectedItem = convertToMenuItem([state.menuItems[0].name]);
        state.selectedCriteria = state.dataInfoMenuItems[0]?.name;
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[0]?.name,
            criteria: state.dataInfoMenuItems[0]?.name,
        };
        state.selectedItem = state.menuItems[0]?.name;
        state.selectedCriteria = state.dataInfoMenuItems[0]?.name;
    }
    state.proxyValue = { ...state.proxyValue, fieldType: value };
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
const isIncludedInDataInfoMenuItems = (data: string):boolean => state.dataInfoMenuItems.some((m) => m?.name === data);
const convertToMenuItem = (data: string[]) => data.map((d) => ({
    name: d,
    label: d,
}));

watch(() => labelsMenuItem.value, (value) => {
    if (!(value.find((d) => d.name === state.selectedItem)) && (state.selectedFieldType === 'dynamicField')) {
        state.selectedItem = undefined;
        return;
    }
    if ((labelsMenuItem.value ?? []).length >= 2) {
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[DEFAULT_INDEX]?.name,
            criteria: state.dataInfoMenuItems[0]?.name,
        };
    }
});

watch(() => state.selectedFieldType, (selectedFieldType) => {
    if (selectedFieldType === 'dynamicField') {
        const labelsInfo = props.dataTable?.labels_info;
        if (!labelsInfo) return;
        if (Object.keys(labelsInfo).length < 2) {
            emit('show-error-modal', MIN_LABELS_INFO_COUNT);
            return;
        }
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[DEFAULT_INDEX]?.name,
            criteria: state.dataInfoMenuItems[0]?.name,
        };
    }
}, { immediate: true });

watch(() => state.menuItems, (menuItems) => {
    if (!Array.isArray(menuItems)) return;
    const isIncludedInMenuItems = (data: string[]|string):boolean => {
        if (Array.isArray(data)) {
            return data.every((d) => menuItems.some((m) => m.name === d));
        }
        return menuItems.some((m) => m.name === data);
    };
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
            criteria: isIncludedInDataInfoMenuItems(state.proxyValue?.criteria) ? state.proxyValue?.criteria : state.dataInfoMenuItems[0]?.name,
        };
        state.selectedItem = state.proxyValue?.value ?? state.menuItems[0]?.name;
        state.selectedCriteria = state.proxyValue?.criteria ?? state.dataInfoMenuItems[0]?.name;
    }
}, { immediate: true });
/* Init */
onMounted(() => {
    state.selectedFieldType = props.value?.fieldType ?? DEFAULT_FIELD_TYPE;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: state.selectedFieldType,
            value: props.value?.value ?? [state.menuItems[0]?.name],
        };
        state.selectedItem = convertToMenuItem(state.proxyValue?.value);
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: state.selectedFieldType,
            value: props.value?.value ?? state.menuItems?.[1]?.name,
            criteria: isIncludedInDataInfoMenuItems(state.proxyValue?.criteria) ? state.proxyValue?.criteria : state.dataInfoMenuItems[0]?.name,
        };
        state.selectedItem = state.proxyValue?.value ?? state.menuItems[0]?.name;
        state.selectedCriteria = state.proxyValue?.criteria ?? state.dataInfoMenuItems[0]?.name;
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
            <p-field-group v-if="state.selectedFieldType === 'dynamicField'"
                           :label="$t('COMMON.WIDGETS.CRITERIA')"
                           style-type="secondary"
                           required
                           class="criteria-field"
            >
                <p-select-dropdown :menu="state.dataInfoMenuItems"
                                   :selected="state.selectedCriteria"
                                   show-select-marker
                                   appearance-type="badge"
                                   @update:selected="handleUpdateCriteria"
                />
            </p-field-group>
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
.criteria-field {
    @apply w-full;
    margin-bottom: 0.5rem;
}
</style>
