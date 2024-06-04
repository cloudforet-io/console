<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PSelectDropdown, PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { TotalFieldOptions, WidgetFieldSchema } from '@/common/modules/widgets/types/widget-config-type';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<TotalFieldOptions>;
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
    <div class="widget-field-total-field">
        <p-field-group :label="props.widgetFieldSchema.label"
                       required
        >
            <p-select-dropdown :menu="state.menuItems" />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}
</style>
