<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type {
    StackByFieldOptions, WidgetFieldSchema,
} from '@/common/modules/widgets/types/widget-config-type';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<StackByFieldOptions>;
}
const props = withDefaults(defineProps<Props>(), {
    widgetFieldSchema: () => ({
        label: '',
    }),
});

const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});
</script>

<template>
    <div class="widget-field-stack-by">
        <p-field-group :label="props.widgetFieldSchema.label"
                       required
        >
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems" />
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
