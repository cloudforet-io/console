<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';


import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_FIELD_HEATMAP_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit, DataFieldHeatmapColorOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type {
    DataFieldHeatmapColorValue,
    DataFieldHeatmapColor,
} from '@/common/modules/widgets/types/widget-field-value-type';

const emit = defineEmits<WidgetFieldComponentEmit<DataFieldHeatmapColorValue>>();
const props = defineProps<WidgetFieldComponentProps<DataFieldHeatmapColorOptions, DataFieldHeatmapColorValue>>();
const state = reactive({
    isInitiated: false,
    proxyValue: useProxyValue<DataFieldHeatmapColorValue|undefined>('value', props, emit),
    dataFieldList: computed<string[]>(() => Object.keys(props.dataTable?.data_info ?? {}) ?? []),
    menuItems: computed<SelectDropdownMenuItem[]>(() => Object.entries(DATA_FIELD_HEATMAP_COLOR).map(([key, value]) => ({
        label: value.label,
        name: key,
    }))),
});

/* Util */
const getDataFieldHeatmapColor = (colorKey: DataFieldHeatmapColor) => DATA_FIELD_HEATMAP_COLOR[colorKey].color;

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
    <div class="widget-field-number-format">
        <p-field-group :label="$t('COMMON.WIDGETS.NUMBER_FORMAT.NUMBER_FORMAT')"
                       required
        >
            <template v-if="state.dataFieldList.length > 1">
                <p-field-group v-for="dataField in state.dataFieldList"
                               :key="`number-format-data-field-${dataField}`"
                               :label="dataField"
                               style-type="secondary"
                               required
                >
                    <p-select-dropdown class="w-full"
                                       use-fixed-menu-style
                                       reset-selection-on-menu-close
                                       :menu="state.menuItems"
                                       :selected="state.proxyValue?.[dataField]?.value"
                                       @select="handleSelectMenuItem(dataField, $event)"
                    >
                        <template #dropdown-button="item">
                            <div class="menu-item">
                                <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                     :class="{'color-circle': true, [`bg-${getDataFieldHeatmapColor(item.name)}`]: !!getDataFieldHeatmapColor(item.name)}"
                                />
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                        <template #menu-item--format="{item}">
                            <div class="menu-item">
                                <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                     :class="{'color-circle': true, [`bg-${getDataFieldHeatmapColor(item.name)}`]: !!getDataFieldHeatmapColor(item.name)}"
                                />
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </p-field-group>
            </template>
            <template v-else>
                <p-select-dropdown v-for="dataField in state.dataFieldList"
                                   :key="`number-format-data-field-${dataField}`"
                                   class="w-full"
                                   use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   :menu="state.menuItems"
                                   :selected="state.proxyValue?.[dataField]?.value"
                                   @select="handleSelectMenuItem(dataField, $event)"
                >
                    <template #dropdown-button="item">
                        <div class="menu-item">
                            <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                 :class="{'color-circle': true, [`bg-${getDataFieldHeatmapColor(item.name)}`]: !!getDataFieldHeatmapColor(item.name)}"
                            />
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="menu-item">
                            <div v-if="item.name !== DATA_FIELD_HEATMAP_COLOR.NONE.key"
                                 :class="{'color-circle': true, [`bg-${getDataFieldHeatmapColor(item.name)}`]: !!getDataFieldHeatmapColor(item.name)}"
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
.widget-field-number-format {
    .menu-item {
        @apply flex items-center gap-1;
        .color-circle {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
    }
}
</style>
