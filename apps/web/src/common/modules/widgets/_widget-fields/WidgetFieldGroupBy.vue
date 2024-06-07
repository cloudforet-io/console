<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    GroupByOptions,
} from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<GroupByOptions>>(), {
    widgetFieldSchema: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<string | string[]>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    selectedItem: undefined as undefined | MenuItem[] | string,
    isValid: computed<boolean>(() => {
        if (Array.isArray(state.selectedItem)) {
            return !!state.selectedItem.length;
        }
        return !!state.selectedItem;
    }),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedItem = val;
    if (Array.isArray(val)) {
        state.proxyValue = val.map((item) => item.name);
    } else {
        state.proxyValue = val;
    }
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});
</script>

<template>
    <div class="widget-field-group-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GROUP_BY')"
                       required
        >
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems"
                                   :selected="state.selectedItem"
                                   :multi-selectable="props.widgetFieldSchema.options?.multiSelectable"
                                   show-select-marker
                                   appearance-type="badge"
                                   @update:selected="handleUpdateSelect"
                />
                <p-text-input type="number"
                              :min="0"
                />
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
}
</style>
