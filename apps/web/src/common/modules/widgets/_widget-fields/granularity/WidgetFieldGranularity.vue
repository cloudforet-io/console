<script lang="ts" setup>
import { asyncComputed } from '@vueuse/core/index';
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { PSelectDropdown, PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { VariableModelFactory } from '@/lib/variable-models';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const props = defineProps<WidgetFieldComponentProps<undefined, string>>();
const emit = defineEmits<WidgetFieldComponentEmit<string>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    granularityMenuItems: asyncComputed<MenuItem[]>(async () => {
        const model = new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'granularity' });
        const { results } = await model.list();
        return results.map((d) => ({ name: d.key, label: d.name }));
    }),
    isValid: computed<boolean>(() => ((state.granularityMenuItems?.length) ? !!state.proxyValue?.length : false)),
});

/* Event */
const handleUpdateSelect = (val: string) => {
    if (val === state.proxyValue) return;
    state.proxyValue = val;
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

onMounted(() => {
    if (props.value) {
        state.proxyValue = props.value;
    } else {
        state.proxyValue = 'MONTHLY';
    }
});
</script>

<template>
    <div class="widget-field-granularity">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GRANULARITY')"
                       required
        >
            <p-select-dropdown :menu="state.granularityMenuItems"
                               :selected="state.proxyValue"
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
