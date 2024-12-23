<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';

import {
    PFieldGroup, PFieldTitle, PTextInput, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';


import type { TableColumnWidthValue, TableColumnWidthOptions } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'tableColumnWidth';

const props = defineProps<WidgetFieldComponentProps<TableColumnWidthOptions>>();
const state = reactive({
    fieldValue: computed<TableColumnWidthValue>(() => props.fieldManager.data[FIELD_KEY].value),
    // Base
    widthTypeItems: computed(() => [
        { label: i18n.t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.AUTO'), value: 'auto' },
        { label: i18n.t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.FIX'), value: 'fixed' },
    ]),
    selectedWidthType: computed(() => state.fieldValue?.widthType),
    fixedWidthInvalid: computed(() => {
        if (state.fieldValue.widthType === 'auto') return false;
        const fixedWidth = state.fieldValue.fixedWidth;
        if (fixedWidth === undefined) return true;
        if (fixedWidth === 0) return true;
        if (fixedWidth < state.fieldValue.minimumWidth) return true;
        return false;
    }),
    fixedWidthInvalidText: computed(() => {
        if (state.fieldValue.widthType === 'auto') return '';
        const fixedWidth = state.fieldValue.fixedWidth;
        if (fixedWidth === undefined || fixedWidth === 0) return i18n.t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.INVALID_LENGTH');
        if (fixedWidth < state.fieldValue.minimumWidth) return i18n.t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.INVALID_MINIMUM_WIDTH');
        return '';
    }),
});
/* Event */
const handleChangeWidthType = (value: TableColumnWidthValue['widthType']) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        widthType: value,
        fixedWidth: undefined,
    });
};

const handleChangeMinimumWidth = (value: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        minimumWidth: Number(value) || 0,
    });
};
const handleChangeFixedWidth = (value: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        fixedWidth: Number(value) || 0,
    });
};

</script>

<template>
    <div class="widget-field-table-column-width">
        <p-field-group :label="$t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.TABLE_COLUMN_WIDTH')"
                       required
        >
            <div class="field-contents-wrapper">
                <div class="field-wrapper">
                    <p-field-title class="width-sub-title">
                        {{ $t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.MINIMUM_WIDTH') }}
                    </p-field-title>
                    <p-text-input :value="state.fieldValue?.minimumWidth"
                                  type="number"
                                  :min="0"
                                  @update:value="handleChangeMinimumWidth"
                    />
                </div>
                <div class="field-wrapper width-field">
                    <div class="type-select-wrapper">
                        <p-field-title class="width-sub-title">
                            {{ $t('COMMON.WIDGETS.TABLE_COLUMN_WIDTH.WIDTH') }}
                        </p-field-title>
                        <p-radio-group direction="horizontal">
                            <p-radio v-for="(item) in state.widthTypeItems"
                                     :key="`width-type-${item.value}`"
                                     :value="item.value"
                                     :selected="state.selectedWidthType"
                                     @change="handleChangeWidthType"
                            >
                                <span class="radio-item">
                                    {{ item.label }}
                                </span>
                            </p-radio>
                        </p-radio-group>
                    </div>
                    <div v-if="state.selectedWidthType === 'fixed'"
                         class="fixed-width-input-wrapper"
                    >
                        <p-text-input :value="state.fieldValue?.fixedWidth"
                                      class="fixed-width-input"
                                      size="md"
                                      type="number"
                                      :min="0"
                                      :invalid="state.fixedWidthInvalid"
                                      @update:value="handleChangeFixedWidth"
                        />
                        <p class="invalid-text">
                            {{ state.fixedWidthInvalidText }}
                        </p>
                    </div>
                </div>
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.widget-field-table-column-width {
    .field-contents-wrapper {
        width: 100%;
        padding-top: 0.25rem;

        .field-wrapper {
            margin-bottom: 0.5rem;
            .width-sub-title {
                margin-bottom: 0.25rem;
            }
            .type-select-wrapper {
                min-width: 9rem;
                width: auto;
            }
            .fixed-width-input-wrapper {
                padding-top: 0.75rem;
                width: calc(100% - 9rem);
                .invalid-text {
                    @apply text-label-sm text-red-500;
                    margin-top: 0.25rem;
                }
            }

            &.width-field {
                @apply flex;
            }

            /* custom design-system component - p-field-title */
            :deep(.p-field-title) {
                .title {
                    @apply text-gray-600 text-label-sm;
                }
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    max-width: 7.5rem;
}
</style>
