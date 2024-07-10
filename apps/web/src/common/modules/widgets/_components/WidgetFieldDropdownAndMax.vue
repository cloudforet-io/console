<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PTooltip, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    getDefaultMenuItemIndex,
    getInitialSelectedMenuItem,
} from '@/common/modules/widgets/_helpers/widget-field-helper';


const props = withDefaults(defineProps<{
    defaultCount?: number;
    max?: number;
    menuItems: MenuItem[];
    fieldName?:string|TranslateResult;
    defaultIndex?: number;
    excludeDateField?: boolean;
    value?: {value?: string; count?: number};
}>(), {
    defaultCount: 1,
    max: undefined,
    fieldName: '',
    menuItems: () => ([]),
    defaultIndex: 0,
    excludeDateField: false,
    value: () => ({}),
});
const emit = defineEmits<{(e: 'update:is-valid', isValid:boolean): void;
    (e: 'update:value', value: {value: string; count: number}): void;
}>();
const state = reactive({
    isInitiated: false,
    proxyValue: useProxyValue('value', props, emit),
    isMaxValid: computed<boolean>(() => (props.max ? ((state.proxyValue?.count <= props.max) && !!state.proxyValue?.count) : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: props.fieldName,
        max: props.max,
    })),
    isAllValid: computed<boolean>(() => ((props.menuItems.length) ? state.isMaxValid : false)),
    selectedItem: undefined as undefined | MenuItem[],
});

/* Event */
const handleUpdateSelect = (val: string) => {
    if (val === state.proxyValue.value) return;
    state.proxyValue = { ...state.proxyValue, value: val };
};
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue.count) return;
    state.proxyValue = { ...state.proxyValue, count: val ?? 1 };
};

/* Watcher */
watch(() => state.isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

/* Init */
const initValue = () => {
    state.proxyValue = {
        ...state.proxyValue,
        value: props.value?.value,
        count: props.value?.count,
    };
};
watch(() => props.menuItems, (menuItems) => {
    if (!state.isInitiated) {
        initValue();
        state.isInitiated = true;
    }

    if (!menuItems?.length) return;

    const _defaultIndex = getDefaultMenuItemIndex(props.menuItems, props.defaultIndex, props.excludeDateField);
    const _value = getInitialSelectedMenuItem(menuItems, state.proxyValue?.value, _defaultIndex);
    state.proxyValue = {
        value: _value,
        count: props.value?.count ?? props.defaultCount ?? 5,
    };
}, { immediate: true });
</script>

<template>
    <div class="field-form-wrapper">
        <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                       style-type="secondary"
                       required
                       class="w-full"
        >
            <p-select-dropdown :menu="props.menuItems"
                               class="w-full"
                               :selected="state.proxyValue?.value"
                               use-fixed-menu-style
                               @update:selected="handleUpdateSelect"
            />
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
                       style-type="secondary"
                       class="max-items"
                       :invalid="!state.isMaxValid"
                       :invalid-text="$t('COMMON.WIDGETS.NUMBER_FIELD_VALIDATION', {max: props.max})"
                       required
        >
            <p-text-input type="number"
                          :min="1"
                          :max="props.max"
                          :invalid="!state.isMaxValid"
                          :value="state.proxyValue?.count"
                          @update:value="handleUpdateCount"
            />
            <template #label-extra>
                <p-tooltip v-if="props.max"
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
</template>

<style lang="postcss" scoped>
.field-form-wrapper {
    display: flex;
    gap: 0.5rem;

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

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
