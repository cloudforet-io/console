<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/_WidgetFieldDropdownAndMax.vue';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    CategoryByOptions,
} from '@/common/modules/widgets/_widget-fields/category-by/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'categoryBy';
const props = defineProps<_WidgetFieldComponentProps<CategoryByOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;

const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!widgetGenerateGetters.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(widgetGenerateGetters.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

</script>

<template>
    <div class="widget-field-category-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CATEGORY_BY')"
                       required
        >
            <widget-field-dropdown-and-max :field-key="FIELD_KEY"
                                           :field-manager="props.fieldManager"
                                           :default-count="props.widgetFieldSchema?.options?.defaultMaxCount"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CATEGORY_BY')"
                                           :exclude-date-field="props.widgetFieldSchema?.options?.excludeDateField"
            />
        </p-field-group>
    </div>
</template>
