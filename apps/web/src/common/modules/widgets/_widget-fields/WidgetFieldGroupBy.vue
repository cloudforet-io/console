<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    GroupByOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { GroupByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = withDefaults(defineProps<WidgetFieldComponentProps<GroupByOptions>>(), {
});
const emit = defineEmits<WidgetFieldComponentEmit<GroupByValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    selectedItem: undefined as undefined | MenuItem[] | string,
    isValid: computed<boolean>(() => {
        if (!props.widgetFieldSchema.options?.hideCount && !state.proxyValue?.count) return false;
        if (props.widgetFieldSchema.options?.multiSelectable && !state.selectedItem?.length) return false;
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
const handleUpdateCount = (val: number) => {
    if (val === state.proxyValue.count) return;
    state.proxyValue = { ...state.proxyValue, count: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

/* Init */
onMounted(() => {
    // TODO: set state.proxyValue with the value from the widget or set default value
    state.proxyValue = {
        value: state.menuItems[0]?.name, // TODO: string | string[]
        count: props.widgetFieldSchema.options?.default,
    };
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
                <p-text-input v-if="!widgetFieldSchema.options?.hideCount"
                              type="number"
                              :min="1"
                              :max="props.widgetFieldSchema.options?.max || 100"
                              @update:value="handleUpdateCount"
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
