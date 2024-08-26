<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import {
    flatMap, isEqual, map, uniq,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectDropdown, PFieldGroup, PTextInput, PSelectButton, PTooltip, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import { DATE_FIELD, REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import { getWidgetBasedOnDate, getWidgetDateRange } from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getInitialSelectedMenuItem, isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { TableDataItem, DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps, TableDataFieldOptions } from '@/common/modules/widgets/types/widget-field-type';
import type { TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<TableDataItem>;

const DEFAULT_COUNT = 5;
const DEFAULT_FIELD_TYPE = 'staticField';
const props = withDefaults(defineProps<WidgetFieldComponentProps<TableDataFieldOptions, TableDataFieldValue>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<TableDataFieldValue>>();

const { labelsMenuItem } = useGranularityMenuItem(props, 'tableDataField');
const MIN_LABELS_INFO_COUNT = 1;
const DEFAULT_INDEX = 1;

const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed(() => allReferenceStore.getters.workspace),
    region: computed(() => allReferenceStore.getters.region),
    serviceAccount: computed(() => allReferenceStore.getters.serviceAccount),
});

const state = reactive({
    isInitiated: false,
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
        if (state.proxyValue.fieldType === 'dynamicField' && !state.proxyValue.dynamicFieldValue?.length) return false;
        if (Array.isArray(state.selectedItem)) {
            return !!state.selectedItem.length;
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
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? (state.proxyValue?.count <= state.max) && !!state.proxyValue?.count : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
    hideCount: computed<boolean>(() => {
        if (state.selectedFieldType === 'dynamicField') {
            return props.widgetFieldSchema?.options?.hideDynamicFieldMaxCount ?? false;
        }
        return props.widgetFieldSchema?.options?.hideStaticFieldMaxCount ?? false;
    }),
    // Dynamic Field Fetching
    basedOnDate: computed(() => getWidgetBasedOnDate(props.allValueMap?.granularity as string, props.dateRange?.end)),
    dateRange: computed<DateRange>(() => {
        const _granularity = props.allValueMap?.granularity as string;
        const _groupBy = props.allValueMap?.groupBy?.value as string[];
        const _basedOnDate = getWidgetBasedOnDate(_granularity, props.dateRange?.end);
        let subtract = 1;
        if (isDateField(state.proxyValue.value) || _groupBy?.some((groupBy) => Object.values(DATE_FIELD).includes(groupBy))) {
            if (_granularity === GRANULARITY.YEARLY) subtract = 3;
            if (_granularity === GRANULARITY.MONTHLY) subtract = 12;
            if (_granularity === GRANULARITY.DAILY) subtract = 30;
        }
        const [start, end] = getWidgetDateRange(_granularity, _basedOnDate, subtract);
        return { start, end };
    }),
    dynamicFields: undefined as undefined | string[],
    dynamicFieldMenuItems: computed<MenuItem[]>(() => {
        if (state.proxyValue.fieldType === 'staticField') return [];
        const selected = state.proxyValue.dynamicFieldValue ?? [];
        const maxCount = state.proxyValue.count;
        return state.dynamicFields?.map((d) => {
            const fieldName = state.proxyValue.value;
            const label = Object.keys(REFERENCE_FIELD_MAP).includes(fieldName) ? storeState[REFERENCE_FIELD_MAP[fieldName]][d]?.label || d : d;
            return {
                name: d,
                label,
                disabled: selected.length === Number(maxCount) && !selected.includes(d),
            };
        }) ?? [];
    }),
    selectedMenuItems: computed(() => state.dynamicFieldMenuItems.filter((d) => state.proxyValue.dynamicFieldValue?.includes(d.name))),
    visibleMenu: false,
    loading: false,
});


/* Event */
const handleUpdateCriteria = (val: string|MenuItem[]) => {
    state.selectedCriteria = val;
    state.proxyValue = {
        ...state.proxyValue,
        criteria: val,
        dynamicFieldValue: [],
    };
};
const handleChangeDataFieldType = (value: string) => {
    state.selectedFieldType = value;
    if (state.selectedFieldType === 'staticField') {
        state.proxyValue = {
            ...state.proxyValue,
            value: [state.menuItems[0]?.name],
            criteria: undefined,
            dynamicFieldValue: undefined,
        };
        state.selectedItem = convertToMenuItem([state.menuItems[0].name]);
        state.selectedCriteria = state.dataInfoMenuItems[0]?.name;
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: state.menuItems[0]?.name,
            criteria: state.dataInfoMenuItems[0]?.name,
            dynamicFieldValue: [],
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
            dynamicFieldValue: [],
        };
    }
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue?.count) return;
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldValue: undefined,
        count: val,
    };
};
const handleSelectDynamicFields = (value: MenuItem[]) => {
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldValue: value.map((d) => d.name),
    };
    if (value.length === Number(state.proxyValue.count)) {
        state.visibleMenu = false;
    }
};

const handleClearDynamicFieldsSelection = () => {
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldValue: [],
    };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});
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
            value: props.value?.value ?? state.menuItems[DEFAULT_INDEX]?.name,
            criteria: state.dataInfoMenuItems[0]?.name,
            dynamicFieldValue: [],
        };
    }
}, { immediate: true });

// Init Value
const initValue = () => {
    state.selectedFieldType = props.value?.fieldType ?? DEFAULT_FIELD_TYPE;
    state.proxyValue = {
        ...state.proxyValue,
        fieldType: state.selectedFieldType,
        value: props.value?.value,
        criteria: props.value?.criteria,
        count: props.value?.count ?? DEFAULT_COUNT,
        dynamicFieldValue: state.selectedFieldType === 'dynamicField' ? props.value?.dynamicFieldValue ?? [] : undefined,
    };
    if (state.selectedFieldType === 'staticField') {
        state.selectedItem = convertToMenuItem(state.proxyValue?.value);
    } else {
        state.selectedItem = state.proxyValue?.value;
        state.selectedCriteria = state.proxyValue?.criteria;
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
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.value ?? [], 0);
        state.selectedItem = convertToMenuItem(_value);
    } else {
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.value, 0);
        _criteria = getInitialSelectedMenuItem(state.dataInfoMenuItems, state.proxyValue?.criteria, 0);
        state.selectedItem = _value;
        state.selectedCriteria = _criteria;
    }
    state.proxyValue = {
        ...state.proxyValue,
        value: _value,
        criteria: _criteria,
    };
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
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                group_by: [...(props.allValueMap?.groupBy?.value ?? []), state.proxyValue?.value],
                granularity: props.allValueMap?.granularity,
                field_group: [state.proxyValue?.value],
                fields: {
                    [state.proxyValue?.criteria]: { key: state.proxyValue?.criteria, operator: 'sum' },
                },
                ...state.dateRange,
            },
        });
        const values = flatMap(res.results ?? [], (item) => map(item[state.proxyValue.criteria], state.proxyValue.value));
        state.dynamicFields = uniq(values);
    } catch (e) {
        showErrorMessage(e, '');
        state.dynamicFields = [];
    } finally {
        state.loading = false;
    }
};
const resetDynamicField = () => {
    state.dynamicFields = [];
    state.proxyValue = {
        ...state.proxyValue,
        dynamicFieldValue: [],
    };
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
    () => state.proxyValue.fieldType,
    () => state.proxyValue.value,
    () => state.proxyValue.criteria,
    () => props.allValueMap?.groupBy,
    () => props.allValueMap?.granularity,
    () => state.dateRange,
], async ([_fieldType, _value, _criteria, _groupBy, _granularity, _dateRange], prev) => {
    if (_fieldType === 'staticField') return;
    if (_value === prev[1] && _criteria === prev[2] && isEqual(_groupBy, prev[3]) && _granularity === prev[4] && isEqual(_dateRange, prev[5])) return;
    if (_value === 'Date') {
        resetDynamicField();
        generateDateFields(_granularity as string, _dateRange);
    } else {
        resetDynamicField();
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
                                       :show-select-marker="state.multiSelectable"
                                       :invalid="state.dataFieldInvalid"
                                       appearance-type="badge"
                                       @update:selected="handleUpdateValue"
                    />
                </p-field-group>
                <p-field-group v-if="!state.hideCount"
                               :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
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
            <p-field-group v-if="state.selectedFieldType === 'dynamicField'"
                           required
            >
                <p-select-dropdown class="dynamic-field-select-dropdown"
                                   :menu="state.dynamicFieldMenuItems"
                                   :selected="state.selectedMenuItems"
                                   :visible-menu.sync="state.visibleMenu"
                                   :loading="state.loading"
                                   :invalid="!state.proxyValue?.dynamicFieldValue?.length"
                                   use-fixed-menu-style
                                   multi-selectable
                                   appearance-type="badge"
                                   show-select-marker
                                   show-clear-selection
                                   is-filterable
                                   @update:selected="handleSelectDynamicFields"
                                   @clear-selection="handleClearDynamicFieldsSelection"
                />
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
    .max-items {
        width: 10rem;

        .tooltip {
            position: relative;
            padding-left: 1.25rem;
            .icon {
                position: absolute;
                right: 0;
            }
        }
    }
}
.dynamic-field-select-dropdown {
    margin-top: 0.5rem;
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
