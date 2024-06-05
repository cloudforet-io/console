<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PSelectDropdown, PFieldGroup } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

// import type { TotalFieldOptions } from '@/common/modules/widgets/types/widget-config-type';
// import type { WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


// const props = withDefaults(defineProps<WidgetFieldComponentProps<TotalFieldOptions>>(), {
//     widgetFieldSchema: () => ({}),
// });

const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
});
</script>

<template>
    <div class="widget-field-total-field">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL_FIELD')"
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
