<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_FIELD_HEATMAP_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { DataFieldHeatmapColor, DataFieldHeatmapColorValue, DataFieldHeatmapColorOptions } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<DataFieldHeatmapColorValue>>();
const props = defineProps<WidgetFieldComponentProps<DataFieldHeatmapColorOptions, DataFieldHeatmapColorValue>>();
const state = reactive({
    isInitiated: false,
    proxyValue: useProxyValue<DataFieldHeatmapColorValue|undefined>('value', props, emit),
    dataFieldList: computed<string[]>(() => Object.keys(props.dataTable?.data_info ?? {}) ?? []),
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
const getDataFieldHeatmapColor = (colorKey: DataFieldHeatmapColor) => DATA_FIELD_HEATMAP_COLOR[colorKey].key.toLowerCase();

/* Event */
const handleSelectMenuItem = (dataField: string, selected: DataFieldHeatmapColor) => {
    state.proxyValue = {
        ...state.proxyValue,
        [dataField]: {
            value: selected,
        },
    };
};

/* Watcher */
watch(() => state.proxyValue, () => {
    emit('update:is-valid', true);
}, { immediate: true });
watch(() => state.dataFieldList, (dataFieldList) => {
    if (!dataFieldList.length) return;
    const _proxyValue: DataFieldHeatmapColorValue = {};
    dataFieldList.forEach((d) => {
        _proxyValue[d] = {
            value: state.proxyValue?.[d]?.value ?? props.widgetConfig?.optionalFieldsSchema.dataFieldHeatmapColor?.options?.default ?? DATA_FIELD_HEATMAP_COLOR.NONE.key,
        };
    });
    state.proxyValue = _proxyValue;
}, { immediate: true });

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
                                           :selected="state.proxyValue?.[dataField]?.value"
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
                                   :selected="state.proxyValue?.[dataField]?.value"
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
