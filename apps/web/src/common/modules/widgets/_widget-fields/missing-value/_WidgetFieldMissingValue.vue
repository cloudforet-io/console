<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import type {
    MissingValueOptions,
    _MissingValueValue,
} from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'missingValue';

const props = defineProps<_WidgetFieldComponentProps<MissingValueOptions>>();

const state = reactive({
    fieldValue: computed<_MissingValueValue>(() => props.fieldManager.data[FIELD_KEY].value),
    missingValueMenuItems: computed<MenuItem[]>(() => [
        {
            name: 'lineToZero',
            label: i18n.t('COMMON.WIDGETS.MISSING_VALUE.LINE_TO_ZERO'),
        },
        {
            name: 'lineBreaks',
            label: i18n.t('COMMON.WIDGETS.MISSING_VALUE.LINE_BREAKS'),
        },
    ]),
});

/* Event */
const handleChangeMissingValue = (value: _MissingValueValue['type']) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        type: value,
    });
};

</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('COMMON.WIDGETS.MISSING_VALUE.MISSING_VALUE')"
                       required
        >
            <p-select-button v-for="selectItem in state.missingValueMenuItems"
                             :key="`select-button-${selectItem.name}`"
                             :value="selectItem.name"
                             style-type="secondary"
                             :selected="state.fieldValue.type"
                             class="mr-2"
                             @change="handleChangeMissingValue"
            >
                {{ selectItem.label }}
            </p-select-button>
        </p-field-group>
    </div>
</template>

<style scoped lang="scss">
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
