<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';


// const props = withDefaults(defineProps<WidgetFieldComponentProps<CategoryByFieldOptions>>(), {
//     widgetFieldSchema: () => ({}),
// });

const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});
</script>

<template>
    <div class="widget-field-category-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CATEGORY_BY')"
                       required
        >
            <div class="field-form-wrapper">
                <p-select-dropdown :menu="state.menuItems" />
                <p-text-input type="number"
                              disabled
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
