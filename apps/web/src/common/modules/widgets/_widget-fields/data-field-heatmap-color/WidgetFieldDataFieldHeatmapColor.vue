<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import { i18n } from '@/translations';

import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { DATA_FIELD_HEATMAP_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataFieldHeatmapColor,
    DataFieldHeatmapColorOptions,
    DataFieldHeatmapColorValue,
} from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const FIELD_KEY = 'dataFieldHeatmapColor';

const props = defineProps<WidgetFieldComponentProps<DataFieldHeatmapColorOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    isPivotDataTable: computed<boolean>(() => state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    isInitiated: false,
    fieldValue: computed<DataFieldHeatmapColorValue>(() => props.fieldManager.data[FIELD_KEY].value),
    dataFieldList: computed<string[]>(() => {
        const columnFieldForPivot = state.selectedDataTable?.options.PIVOT?.fields?.column;
        if (state.isPivotDataTable && columnFieldForPivot) {
            return [columnFieldForPivot];
        }
        return Object.keys(state.selectedDataTable?.data_info ?? {}) ?? [];
    }),
    menuItems: computed<SelectDropdownMenuItem[]>(() => Object.entries(DATA_FIELD_HEATMAP_COLOR).map(([key, value]) => {
        if (key === DATA_FIELD_HEATMAP_COLOR.NONE.key) {
            return {
                label: i18n.t('COMMON.WIDGETS.TABLE_HEATMAP_COLOR_NONE'),
                name: key,
            };
        }
        return {
            label: value.label,
            name: key,
        };
    })),
});

/* Util */
const getDataFieldHeatmapColor = (colorKey: DataFieldHeatmapColor): string => {
    if (!colorKey) return '';
    return DATA_FIELD_HEATMAP_COLOR[colorKey].key.toLowerCase();
};

/* Event */
const handleSelectMenuItem = (dataField: string, selected: DataFieldHeatmapColor) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        [dataField]: {
            colorInfo: selected,
        },
    });
};

</script>

<template>
    <div class="widget-field-data-field-heatmap-color">
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_FIELD_HEATMAP_COLOR.DATA_FIELD_HEATMAP_COLOR')"
                       required
        >
            <template v-if="state.dataFieldList.length > 1">
                <div class="multi-data-field-wrapper">
                    <p-field-group v-for="dataField in state.dataFieldList"
                                   :key="`number-format-data-field-${dataField}`"
                                   :label="dataField"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown use-fixed-menu-style
                                           reset-selection-on-menu-close
                                           :menu="state.menuItems"
                                           :selected="state.fieldValue?.[dataField]?.colorInfo"
                                           block
                                           @select="handleSelectMenuItem(dataField, $event)"
                        >
                            <template #dropdown-button="item">
                                <div class="menu-item">
                                    <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                         :class="{'color-circle': true, [getDataFieldHeatmapColor(item.name)]: true}"
                                    />
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                            <template #menu-item--format="{item}">
                                <div class="menu-item">
                                    <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                         :class="{'color-circle': true, [getDataFieldHeatmapColor(item.name)]: true}"
                                    />
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </p-field-group>
                </div>
            </template>
            <template v-else>
                <p-select-dropdown v-for="dataField in state.dataFieldList"
                                   :key="`number-format-data-field-${dataField}`"
                                   use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   :menu="state.menuItems"
                                   :selected="state.fieldValue?.[dataField]?.colorInfo"
                                   block
                                   @select="handleSelectMenuItem(dataField, $event)"
                >
                    <template #dropdown-button="item">
                        <div class="menu-item">
                            <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                 :class="{'color-circle': true, [getDataFieldHeatmapColor(item.name)]: true}"
                            />
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="menu-item">
                            <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                 :class="{'color-circle': true, [getDataFieldHeatmapColor(item.name)]: true}"
                            />
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </template>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-data-field-heatmap-color {
    .multi-data-field-wrapper {
        @apply flex flex-col gap-2;
    }
    .menu-item {
        @apply flex items-center gap-1;
        .color-circle {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;

            &.red {
                @apply bg-red-300;
            }
            &.blue {
                @apply bg-blue-300;
            }
            &.green {
                @apply bg-green-300;
            }
            &.yellow {
                @apply bg-yellow-300;
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
