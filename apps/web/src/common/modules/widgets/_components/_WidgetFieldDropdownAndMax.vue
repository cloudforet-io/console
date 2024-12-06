<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PTooltip, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import type WidgetFieldValueManager from '@/common/modules/widgets/_widget-field-value-manager';
import type { WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';

const props = withDefaults(defineProps<{
    fieldKey: keyof WidgetFieldTypeMap;
    fieldManager: WidgetFieldValueManager;
    defaultCount?: number;
    max?: number;
    menuItems: MenuItem[];
    fieldName?:string|TranslateResult;
    excludeDateField?: boolean;
    value?: {value?: string; count?: number};
    commonInvalidState?: boolean;
}>(), {
    defaultCount: 1,
    max: undefined,
    fieldName: '',
    menuItems: () => ([]),
    defaultIndex: 0,
    excludeDateField: false,
    value: () => ({}),
});

const state = reactive({
    isInitiated: false,
    fieldValue: computed<WidgetFieldTypeMap[typeof props.fieldKey]['value']>(() => props.fieldManager.data[props.fieldKey].value),
    isMaxValid: computed<boolean>(() => (props.max ? ((state.fieldValue.count <= props.max) && !!state.fieldValue.count) : true)),
    dataInvalid: computed<boolean>(() => !props.menuItems?.length || !state.fieldValue.data),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: props.fieldName,
        max: props.max,
    })),
    selectedItem: undefined as undefined | MenuItem[],
});

/* Event */
const handleUpdateSelect = (val: string) => {
    if (val === state.fieldValue.data) return;
    props.fieldManager.setFieldValue(props.fieldKey, { ...state.fieldValue, data: val });
};
const handleUpdateCount = (val: number) => {
    if (val === state.fieldValue.count) return;
    props.fieldManager.setFieldValue(props.fieldKey, { ...state.fieldValue, count: val ?? 1 });
};

</script>

<template>
    <div class="field-form-wrapper">
        <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                       style-type="secondary"
                       required
                       class="w-full"
        >
            <p-select-dropdown :menu="props.menuItems"
                               :selected="state.fieldValue?.data"
                               :invalid="state.dataInvalid"
                               use-fixed-menu-style
                               block
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
                          :value="state.fieldValue?.count"
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
