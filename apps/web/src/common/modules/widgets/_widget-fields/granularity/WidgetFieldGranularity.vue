<script lang="ts" setup>
import { asyncComputed } from '@vueuse/core/index';
import {
    computed, reactive,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { VariableModelFactory } from '@/lib/variable-models';

import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'granularity';

const props = defineProps<WidgetFieldComponentProps<undefined>>();
const state = reactive({
    fieldValue: computed<GranularityValue>(() => props.fieldManager.data[FIELD_KEY].value),
    granularityMenuItems: asyncComputed<MenuItem[]>(async () => {
        const model = new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'granularity' });
        const { results } = await model.list();
        return results.map((d) => ({ name: d.key, label: d.name }));
    }),
});

/* Event */
const handleUpdateSelect = (val: GranularityValue['granularity']) => {
    if (val === state.fieldValue.granularity) return;
    props.fieldManager.setFieldValue(FIELD_KEY, { granularity: val });
};

</script>

<template>
    <div class="widget-field-granularity">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GRANULARITY')"
                       required
        >
            <p-select-dropdown :menu="state.granularityMenuItems"
                               :selected="state.fieldValue.granularity"
                               block
                               @update:selected="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
