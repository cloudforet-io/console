<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PTooltip, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    GroupByOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { GroupByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const DEFAULT_COUNT = 5;
const props = withDefaults(defineProps<WidgetFieldComponentProps<GroupByOptions>>(), {
    value: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<GroupByValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget ?? 'labels_info';
        if (!props.dataTable) return [];
        const dataInfoList = Object.keys(props.dataTable[dataTarget] ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    fieldName: computed(() => i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GROUP_BY')),
    selectedItem: undefined as undefined | MenuItem[] | string,
    isValid: computed<boolean>(() => {
        if (!props.widgetFieldSchema?.options?.hideCount && !state.proxyValue?.count) return false;
        if (state.multiselectable && !state.selectedItem?.length) return false;
        return !!state.selectedItem;
    }),
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? (state.proxyValue?.count <= state.max) : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (Array.isArray(val)) {
        state.proxyValue.value = val.map((item) => item.name);
    } else {
        state.proxyValue.value = val;
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

const convertToMenuItem = (data: string[]) => data.map((d) => ({
    name: d,
    label: d,
}));

/* Init */
onMounted(() => {
    if (state.multiselectable) {
        state.proxyValue.value = state.proxyValue?.value ?? [state.menuItems[0]?.name];
        state.selectedItem = convertToMenuItem(state.proxyValue?.value);
    } else {
        state.proxyValue.value = state.proxyValue?.value ?? state.menuItems[0]?.name;
        state.selectedItem = state.menuItems[0]?.name;
    }
    state.proxyValue.count = state.proxyValue.count ?? props.widgetFieldSchema?.options?.defaultMaxCount ?? DEFAULT_COUNT;
});
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
                                       appearance-type="badge"
                                       @update:selected="handleUpdateSelect"
                    />
                </p-field-group>
                <p-field-group :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
                               style-type="secondary"
                               class="max-items"
                               :invalid="!state.isMaxValid"
                               :invalid-text="$t('COMMON.WIDGETS.NUMBER_FIELD_VALIDATION', {max: state.max})"
                               required
                >
                    <p-text-input v-if="!widgetFieldSchema?.options?.hideCount"
                                  type="number"
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
</style>
