<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PTooltip, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import {
    getDefaultMenuItemIndex,
    getInitialSelectedMenuItem,
} from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    GroupByOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { GroupByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const DEFAULT_COUNT = 5;
const props = withDefaults(defineProps<WidgetFieldComponentProps<GroupByOptions, GroupByValue>>(), {
    value: () => ({}),
});

const { labelsMenuItem } = useGranularityMenuItem(props, 'groupBy');

const emit = defineEmits<WidgetFieldComponentEmit<GroupByValue>>();
const state = reactive({
    isInitiated: false,
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget ?? 'labels_info';
        if (!props.dataTable) return [];
        if (dataTarget === 'labels_info') return labelsMenuItem.value;
        const dataInfoList = sortWidgetTableFields(Object.keys(props.dataTable[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    hideCount: computed(() => props.widgetFieldSchema?.options?.hideCount),
    fixedValue: computed(() => props.widgetFieldSchema?.options?.fixedValue),
    fieldName: computed(() => i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GROUP_BY')),
    selectedItem: undefined as undefined | MenuItem[] | string,
    isValid: computed<boolean>(() => {
        if (!state.hideCount && !state.proxyValue?.count) return false;
        if (state.multiselectable && !state.selectedItem?.length) return false;
        if (state.fixedValue) return state.selectedItem?.[0]?.label === state.fixedValue || state.selectedItem === state.fixedValue;
        return !!state.selectedItem;
    }),
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? ((state.proxyValue?.count ?? DEFAULT_COUNT) <= state.max) : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (Array.isArray(val)) {
        state.proxyValue = {
            ...state.proxyValue,
            value: val.map((item) => item.name),
        };
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            value: val,
        };
    }
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
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
    let isSelectedValueValid = false;
    if (state.selectedItem === undefined) {
        if (state.multiselectable) {
            state.selectedItem = [value?.[0]?.name];
        } else {
            state.selectedItem = value?.[0]?.name;
        }
        state.proxyValue = {
            ...state.proxyValue,
            value: state.selectedItem,
        };
        return;
    }
    if (Array.isArray(state.selectedItem)) {
        isSelectedValueValid = state.selectedItem.every((item) => value.some((v) => v.name === item.name));
    } else {
        isSelectedValueValid = value.some((v) => v.name === state.selectedItem);
    }
    if (!isSelectedValueValid) {
        state.selectedItem = undefined;
    }
});

const initValue = () => {
    state.proxyValue = {
        ...state.proxyValue,
        value: state.proxyValue?.value,
        count: state.proxyValue?.count,
    };
    if (state.multiselectable) {
        state.selectedItem = convertToMenuItem(state.proxyValue?.value);
    } else {
        state.selectedItem = state.proxyValue?.value;
    }
};
watch(() => state.menuItems, (menuItems) => {
    if (!state.isInitiated) {
        initValue();
        state.isInitiated = true;
    }

    if (!menuItems?.length) return;

    const _defaultIndex = getDefaultMenuItemIndex(state.menuItems, props.widgetFieldSchema?.options?.defaultIndex, props.widgetFieldSchema?.options?.excludeDateField);
    let _value: string | string[] | undefined;
    if (state.multiselectable) {
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.value ?? [], _defaultIndex);
        state.selectedItem = convertToMenuItem(_value);
    } else if (state.fixedValue) {
        _value = menuItems.some((menu) => menu.name === state.fixedValue) ? state.fixedValue : undefined;
        state.selectedItem = _value;
    } else {
        _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.value, _defaultIndex);
        state.selectedItem = _value;
    }
    state.proxyValue = {
        ...state.proxyValue,
        value: _value,
        count: props.value?.count ?? props.widgetFieldSchema?.options?.defaultMaxCount ?? DEFAULT_COUNT,
    };
}, { immediate: true });
</script>

<template>
    <div class="widget-field-group-by">
        <p-field-group :label="state.fieldName"
                       required
        >
            <div class="field-form-wrapper">
                <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                               style-type="secondary"
                               required
                               class="w-full"
                >
                    <p-select-dropdown :menu="state.menuItems"
                                       :selected="state.selectedItem"
                                       :multi-selectable="state.multiselectable"
                                       show-select-marker
                                       :invalid="!state.isValid"
                                       :disabled="!!state.fixedValue"
                                       appearance-type="badge"
                                       @update:selected="handleUpdateSelect"
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
                                  :value="state.proxyValue?.count"
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
        width: 7.5rem;

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

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
