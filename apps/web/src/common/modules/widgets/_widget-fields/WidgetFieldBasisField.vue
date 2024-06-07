<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { PSelectDropdown, PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { BasisFieldOptions } from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<BasisFieldOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<string>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    isValid: computed<boolean>(() => !!state.proxyValue?.length),
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
</script>

<template>
    <div class="widget-field-basis-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.BASIS_FIELD')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.proxyValue"
                               @update:selected="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>
