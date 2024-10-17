<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import {
    flatMap, isEqual, map, orderBy, uniq,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectDropdown, PFieldGroup, PSelectButton, PDivider, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import { i18n } from '@/translations';


import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getReferenceLabel,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getInitialSelectedMenuItem, isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type {
    TableDataFieldOptions,
    TableDataFieldValue,
} from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import {
    LATEST_TABLE_DATA_FIELD_VERSION,
} from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { TableDataItem, DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


type Data = ListResponse<TableDataItem>;

const DEFAULT_FIELD_TYPE = 'staticField';
const DEFAULT_VALUE_TYPE = 'fixed';
const props = withDefaults(defineProps<WidgetFieldComponentProps<TableDataFieldOptions, TableDataFieldValue>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<TableDataFieldValue>>();

const { labelsMenuItem } = useGranularityMenuItem(props, 'tableDataField');
const MIN_LABELS_INFO_COUNT = 1;
const DEFAULT_INDEX = 1;

const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const storeState = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});

const state = reactive({
    isInitiated: false,
    proxyValue: useProxyValue<TableDataFieldValue>('value', props, emit),
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
        return props.value?.fieldType === 'dynamicField' ? labelsMenuItem.value : state.dataInfoMenuItems;
    }),
    dataInfoMenuItems: computed<MenuItem[]>(() => sortWidgetTableFields(Object.keys(props.dataTable?.data_info ?? {})).map((d) => ({
        name: d,
        label: d,
    }))),
    isValid: computed<boolean>(() => {
        if (state.menuItems.length === 0) return false;
        if (state.proxyValue?.fieldType === 'dynamicField') {
            if (state.proxyValue.dynamicFieldInfo?.valueType === 'fixed' && !state.proxyValue?.dynamicFieldInfo?.fixedValue?.length) return false;
            if (state.proxyValue.dynamicFieldInfo?.valueType === 'auto' && !state.proxyValue?.dynamicFieldInfo?.count) return false;
        }
        if (Array.isArray(state.selectedItem)) {
            return !!state.selectedItem.length;
        }
        if (state.proxyValue?.fieldType === 'staticField') {
            return !!state.proxyValue?.staticFieldInfo?.fieldValue?.length;
        }
        return !!state.selectedItem;
    }),
    dataFieldInvalid: computed(() => {
        if (state.menuItems.length === 0) return true;
        if (Array.isArray(state.selectedItem)) {
            return !state.selectedItem.length;
        }
        return !state.selectedItem;
    }),
    // Dynamic Field Fetching
    basedOnDate: computed(() => getWidgetBasedOnDate(props.allValueMap?.granularity as string, props.dateRange?.end)),
    dateRange: computed<DateRange>(() => {
        const _granularity = props.allValueMap?.granularity as string;
        const _groupBy = (props.allValueMap?.groupBy as GroupByValue)?.value as string[];
        const _basedOnDate = getWidgetBasedOnDate(_granularity, props.dateRange?.end);
        let subtract = 1;
        const _field = state.selectedFieldType === 'staticField' ? state.proxyValue?.staticFieldInfo?.fieldValue : state.proxyValue?.dynamicFieldInfo?.fieldValue;
        if (isDateField(_field) || _groupBy?.some((groupBy) => Object.values(DATE_FIELD).includes(groupBy))) {
            if (_granularity === GRANULARITY.YEARLY) subtract = 3;
            if (_granularity === GRANULARITY.MONTHLY) subtract = 12;
            if (_granularity === GRANULARITY.DAILY) subtract = 30;
        }
        const [start, end] = getWidgetDateRange(_granularity, _basedOnDate, subtract);
        return { start, end };
    }),
    valueTypeItems: computed<MenuItem[]>(() => [
        {
            name: 'auto',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.AUTO'),
        },
        {
            name: 'fixed',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FIXED'),
        },
    ]),
    selectedValueType: DEFAULT_VALUE_TYPE,
    dynamicFields: undefined as undefined | string[],
    dynamicFieldMenuItems: computed<MenuItem[]>(() => {
        if (state.proxyValue?.fieldType === 'staticField') return [];
        return state.dynamicFields?.map((d) => {
            const fieldName = state.proxyValue.dynamicFieldInfo?.fieldValue;
            const label = getReferenceLabel(storeState.allReferenceTypeInfo, fieldName, d);
            return {
                name: d,
                label,
            };
        }) ?? [];
    }),
    selectedDynamicFieldMenuItems: computed(() => state.dynamicFieldMenuItems.filter((d) => state.proxyValue.dynamicFieldInfo?.fixedValue?.includes(d.name))),
    loading: false,
});


/* Event */

const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: 'staticField',
            staticFieldInfo: {
                fieldValue: [state.menuItems[0]?.name],
            },
            dynamicFieldInfo: undefined,
        };
        state.selectedItem = convertToMenuItem([state.menuItems[0].name]);
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: 'dynamicField',
            dynamicFieldInfo: {
                criteria: state.dataInfoMenuItems[0]?.name,
                fieldValue: state.menuItems[0]?.name,
                valueType: DEFAULT_VALUE_TYPE,
                fixedValue: [],
                count: undefined,
            },
            staticFieldInfo: undefined,
        };
        state.selectedItem = state.menuItems[0]?.name;
        state.selectedCriteria = state.dataInfoMenuItems[0]?.name;
    }
};
const handleUpdateValue = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (state.selectedFieldType === 'staticField' && Array.isArray(val)) {
        state.proxyValue = {
            ...state.proxyValue,
            staticFieldInfo: {
                fieldValue: val.map((item) => item?.name),
            },
        };
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            dynamicFieldInfo: {
                ...state.proxyValue.dynamicFieldInfo,
                fieldValue: val,
                fixedValue: state.selectedValueType === 'fixed' ? [] : undefined,
                count: undefined,
            },
        };
    }
};
const handleUpdateCriteria = (val: string|MenuItem[]) => {
    state.selectedCriteria = val;
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldInfo: {
            ...state.proxyValue.dynamicFieldInfo,
            criteria: val,
            fixedValue: state.selectedValueType === 'fixed' ? [] : undefined,
            count: undefined,
        },
    };
};
const handleChangeValueType = (value: string) => {
    state.selectedValueType = value;
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldInfo: {
            ...state.proxyValue.dynamicFieldInfo,
            valueType: value,
            fixedValue: value === 'fixed' ? [] : undefined,
            count: undefined,
        },
    };
};

const handleUpdateCount = (value: number) => {
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldInfo: {
            ...state.proxyValue.dynamicFieldInfo,
            count: value,
        },
    };
};
const handleSelectDynamicFields = (value: MenuItem) => {
    // delete case
    if (state.proxyValue.dynamicFieldInfo?.fixedValue.includes(value.name)) {
        const _orderedFixedValue = orderBy(state.proxyValue.dynamicFieldInfo?.fixedValue?.filter((d) => d !== value.name)) || [];
        state.proxyValue = {
            ...state.proxyValue,
            dynamicFieldInfo: {
                ...state.proxyValue.dynamicFieldInfo,
                fixedValue: _orderedFixedValue,
            },
        };
        return;
    }

    // add case
    const _orderedFixedValue = orderBy([...state.proxyValue.dynamicFieldInfo?.fixedValue || [], value.name]);
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldInfo: {
            ...state.proxyValue.dynamicFieldInfo,
            fixedValue: _orderedFixedValue,
        },
    };
};

const handleClearDynamicFieldsSelection = () => {
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldInfo: {
            ...state.proxyValue.dynamicFieldInfo,
            fixedValue: [],
        },
    };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });
const convertToMenuItem = (data?: string[]) => data?.map((d) => ({
    name: d,
    label: d,
})) ?? [];

watch(() => labelsMenuItem.value, (value) => {
    if (!(value.find((d) => d.name === state.selectedItem)) && (state.selectedFieldType === 'dynamicField')) {
        state.selectedItem = undefined;
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
            dynamicFieldInfo: {
                ...state.proxyValue.dynamicFieldInfo,
                criteria: state.dataInfoMenuItems[0]?.name,
                fieldValue: props.value?.dynamicFieldInfo?.fieldValue ?? state.menuItems[DEFAULT_INDEX]?.name,
                valueType: props.value?.fieldType === 'dynamicField' ? props.value.dynamicFieldInfo?.valueType : undefined,
                fixedValue: (props.value?.fieldType === 'dynamicField' && props.value.dynamicFieldInfo?.valueType === 'fixed') ? (orderBy(props.value?.dynamicFieldInfo?.fixedValue)) : undefined,
                count: props.value?.fieldType === 'dynamicField' && props.value.dynamicFieldInfo?.valueType === 'auto' ? props.value?.dynamicFieldInfo?.count : undefined,
            },
        };
    }
}, { immediate: true });

// Init Value
const initValue = () => {
    state.selectedFieldType = props.value?.fieldType ?? DEFAULT_FIELD_TYPE;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: 'staticField',
            staticFieldInfo: {
                fieldValue: props.value?.staticFieldInfo?.fieldValue,
            },
            version: LATEST_TABLE_DATA_FIELD_VERSION,
        };
        state.selectedItem = convertToMenuItem(state.proxyValue?.staticFieldInfo.fieldValue);
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            fieldType: 'dynamicField',
            dynamicFieldInfo: {
                criteria: props.value?.dynamicFieldInfo?.criteria,
                fieldValue: props.value?.dynamicFieldInfo?.fieldValue,
                valueType: props.value?.dynamicFieldInfo?.valueType ?? DEFAULT_VALUE_TYPE,
                fixedValue: props.value?.dynamicFieldInfo?.valueType === 'auto' ? undefined : orderBy(props.value?.dynamicFieldInfo?.fixedValue),
                ...(props.value?.dynamicFieldInfo?.valueType === 'auto' && { count: props.value?.dynamicFieldInfo?.count }),
            },
            version: LATEST_TABLE_DATA_FIELD_VERSION,
        };
        state.selectedCriteria = state.proxyValue?.dynamicFieldInfo.criteria;
        state.selectedItem = state.proxyValue?.dynamicFieldInfo.fieldValue;
        state.selectedValueType = props.value?.dynamicFieldInfo?.valueType ?? DEFAULT_VALUE_TYPE;
    }
};
watch(() => state.menuItems, (menuItems) => {
    if (!state.isInitiated) {
        initValue();
        state.isInitiated = true;
    }

    if (!menuItems?.length) return;

    let _value: string | string[] | undefined;
    let _criteria: string | undefined;
    if (state.selectedFieldType === 'staticField') {
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.staticFieldInfo.fieldValue ?? [], 0);
        state.selectedItem = convertToMenuItem(_value);
        state.proxyValue = {
            ...state.proxyValue,
            staticFieldInfo: {
                fieldValue: _value,
            },
        };
    } else {
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.dynamicFieldInfo.fieldValue, 0);
        _criteria = getInitialSelectedMenuItem(state.dataInfoMenuItems, state.proxyValue?.dynamicFieldInfo.criteria, 0);
        state.selectedItem = _value;
        state.selectedCriteria = _criteria;

        state.proxyValue = {
            ...state.proxyValue,
            dynamicFieldInfo: {
                ...state.proxyValue.dynamicFieldInfo,
                criteria: _criteria,
                fieldValue: _value,
            },
        };
    }
}, { immediate: true });

/* Dynamic Field Fetching */
const fetchAndExtractDynamicField = async () => {
    if (!props.widgetId) return;
    const _isPrivate = props?.widgetId.startsWith('private');
    const _fetcher = _isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
    try {
        state.loading = true;
        const _field = state.proxyValue?.dynamicFieldInfo?.fieldValue;
        const _criteria = state.proxyValue?.dynamicFieldInfo?.criteria;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                group_by: [...((props.allValueMap?.groupBy as GroupByValue)?.value ?? []), _field],
                granularity: props.allValueMap?.granularity,
                field_group: [_field],
                fields: {
                    [_criteria]: { key: _criteria, operator: 'sum' },
                },
                ...state.dateRange,
            },
        });
        const values = flatMap(res.results ?? [], (item) => map(item[_criteria], _field));
        state.dynamicFields = uniq(values);
    } catch (e) {
        showErrorMessage(e, '');
        state.dynamicFields = [];
    } finally {
        state.loading = false;
    }
};
const generateDateFields = (granularity: string, dateRange: DateRange) => {
    if (!granularity) {
        state.dynamicFields = [];
        return;
    }
    const dateFields: string[] = [];

    let timeUnit: TimeUnit = 'day';
    if (granularity === GRANULARITY.MONTHLY) timeUnit = 'month';
    else if (granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    let labelDateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') labelDateFormat = 'YYYY-MM';
    else if (timeUnit === 'year') labelDateFormat = 'YYYY';

    let start = dayjs.utc(dateRange.start);
    let end = dayjs.utc(dateRange.end);

    if (granularity === GRANULARITY.DAILY) {
        if (!props.dateRange?.start && !props.dateRange?.end) {
            end = dayjs.utc().startOf('day');
            start = end.subtract(30, 'day');
        } else {
            start = dayjs.utc(props.dateRange.start).startOf('month');
            end = start.endOf('month');
        }
    }

    let now = start;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push(now.format(labelDateFormat));
        now = now.add(1, timeUnit);
    }

    state.dynamicFields = dateFields;
};
watch([ // Fetch Dynamic Field
    () => state.proxyValue?.fieldType,
    () => state.proxyValue?.dynamicFieldInfo?.fieldValue,
    () => state.proxyValue?.dynamicFieldInfo?.valueType,
    () => state.proxyValue?.dynamicFieldInfo?.criteria,
    () => props.allValueMap?.groupBy,
    () => props.allValueMap?.granularity,
    () => props.allValueMap?.xAxis?.value,
    () => props.allValueMap?.yAxis?.value,
    () => props.dateRange,
], async (
    [_fieldType, _value, _valueType, _criteria, _groupBy, _granularity, _xAxis, _yAxis, _dateRange],
    [, _prevValue, _prevValueType, _prevCriteria, _prevGroupBy, _prevGranularity, _prevXAxis, _prevYAxis, _prevDateRange],
) => {
    if (_fieldType === 'staticField' || _valueType === 'auto') return;
    const fetchingSkipCondition = _value === _prevValue && _valueType === _prevValueType && _criteria === _prevCriteria
        && isEqual(_groupBy, _prevGroupBy) && _granularity === _prevGranularity
        && isEqual(_xAxis, _prevXAxis) && isEqual(_yAxis, _prevYAxis) && isEqual(_dateRange, _prevDateRange);
    if (fetchingSkipCondition) return;
    const resetConditionByExternalValue = _prevGroupBy && _prevGranularity
        && (!isEqual(_groupBy, _prevGroupBy) || _granularity !== _prevGranularity);
    const _resetByXAxis = _xAxis && _prevXAxis && !isEqual(_xAxis, _prevXAxis);
    const _resetByYAxis = _yAxis && _prevYAxis && !isEqual(_yAxis, _prevYAxis);
    if (resetConditionByExternalValue || _resetByXAxis || _resetByYAxis) {
        state.proxyValue = {
            ...state.proxyValue,
            dynamicFieldInfo: {
                ...state.proxyValue.dynamicFieldInfo,
                fixedValue: [],
            },
        };
    }
    if (_value === 'Date') {
        generateDateFields(_granularity as string, state.dateRange);
    } else {
        await fetchAndExtractDynamicField();
    }
}, { immediate: true });

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
                                 block
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
                                   appearance-type="badge"
                                   block
                                   @update:selected="handleUpdateCriteria"
                />
            </p-field-group>
            <div class="field-form-wrapper">
                <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                               style-type="secondary"
                               required
                               class="w-full"
                >
                    <div class="field-contents-wrapper">
                        <p-select-dropdown :menu="state.menuItems"
                                           :selected="state.selectedItem"
                                           :multi-selectable="state.multiSelectable"
                                           :show-select-marker="state.multiSelectable"
                                           :invalid="state.dataFieldInvalid"
                                           appearance-type="badge"
                                           block
                                           @update:selected="handleUpdateValue"
                        />
                        <template v-if="state.selectedFieldType === 'dynamicField'">
                            <p-divider vertical />
                            <p-select-button v-for="selectItem in state.valueTypeItems"
                                             :key="`select-button-${selectItem.name}`"
                                             class="value-type-button"
                                             :value="selectItem.name"
                                             style-type="secondary"
                                             :selected="state.selectedValueType"
                                             block
                                             @change="handleChangeValueType"
                            >
                                {{ selectItem.label }}
                            </p-select-button>
                        </template>
                    </div>
                </p-field-group>
            </div>
            <p-field-group v-if="state.selectedFieldType === 'dynamicField'"
                           required
            >
                <div class="dynamic-field-value-contents-wrapper">
                    <p-select-dropdown v-if="state.selectedValueType === 'fixed'"
                                       class="dynamic-field-select-dropdown"
                                       :menu="state.dynamicFieldMenuItems"
                                       :selected="state.selectedDynamicFieldMenuItems"
                                       :loading="state.loading"
                                       :invalid="!state.proxyValue?.dynamicFieldInfo?.fixedValue?.length"
                                       use-fixed-menu-style
                                       multi-selectable
                                       appearance-type="badge"
                                       show-select-marker
                                       show-clear-selection
                                       block
                                       @select="handleSelectDynamicFields"
                                       @clear-selection="handleClearDynamicFieldsSelection"
                    />
                    <p-text-input v-else
                                  type="number"
                                  class="dynamic-field-auto-count"
                                  :min="1"
                                  :max="15"
                                  :placeholder="$t('COMMON.WIDGETS.MAX_ITEMS')"
                                  :invalid="!state.proxyValue?.dynamicFieldInfo?.count"
                                  :value="state.proxyValue?.dynamicFieldInfo?.count"
                                  block
                                  @update:value="handleUpdateCount"
                    />
                </div>
            </p-field-group>
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

    .field-contents-wrapper {
        @apply flex gap-2;

        .value-type-button {
            height: 2rem;
            padding: 0 1rem;
        }
    }
}
.dynamic-field-value-contents-wrapper {
    margin-top: 0.5rem;

    .dynamic-field-auto-count {
        height: 2rem;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    .input-container {
        max-height: 2rem;
    }
}

.criteria-field {
    @apply w-full;
    margin-bottom: 0.5rem;
}
</style>
