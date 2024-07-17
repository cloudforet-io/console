<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import { PFieldGroup, PToggleButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import WidgetFieldDropdownAndMax from '@/common/modules/widgets/_components/WidgetFieldDropdownAndMax.vue';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type {
    LineByOptions,
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { LineByValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = defineProps<WidgetFieldComponentProps<LineByOptions, LineByValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<LineByValue|undefined>>();
const { labelsMenuItem } = useGranularityMenuItem(props, 'groupBy');
const state = reactive({
    toggleValue: !!props.value,
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget ?? 'labels_info';
        if (!props.dataTable) return [];
        if (dataTarget === 'labels_info') return labelsMenuItem.value;
        const dataInfoList = sortWidgetTableFields(Object.keys(props.dataTable[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

const initValue = () => {
    if (props.value !== undefined) {
        emit('update:value', cloneDeep(props.value));
    } else if (state.toggleValue) {
        emit('update:value', {
            value: state.menuItems[0].name ?? '',
            count: props.widgetFieldSchema?.options?.max ?? 1,
        });
    } else {
        emit('update:value', undefined);
    }
    emit('update:is-valid', true);
};

/* Event */
const handleChangeToggleButton = (val: boolean) => {
    state.toggleValue = val;
    if (!val) {
        emit('update:value', undefined);
        emit('update:is-valid', true);
    } else {
        initValue();
    }
};
const handleUpdateSelect = (val: LineByValue) => {
    emit('update:value', val);
};

/* Watcher */
const handleIsValid = (isValid: boolean) => {
    emit('update:is-valid', isValid);
};

onMounted(() => {
    if (!state.toggleValue) {
        emit('update:value', undefined);
        emit('update:is-valid', true);
    } else {
        initValue();
    }
});
</script>

<template>
    <div class="widget-field-category-by">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LINE_BY')"
                       class="root-field-group"
                       required
        >
            <template #label-extra>
                <div class="toggle-box">
                    <p-toggle-button :value="state.toggleValue"
                                     class="toggle-button"
                                     @change-toggle="handleChangeToggleButton"
                    />
                </div>
            </template>
            <widget-field-dropdown-and-max v-if="state.toggleValue"
                                           :default-count="props.widgetFieldSchema?.options?.defaultMaxCount"
                                           :value="props.value"
                                           :menu-items="state.menuItems"
                                           :max="props.widgetFieldSchema?.options?.max"
                                           :field-name="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.LINE_BY')"
                                           :default-index="props.widgetFieldSchema?.options?.defaultIndex"
                                           :exclude-date-field="props.widgetFieldSchema?.options?.excludeDateField"
                                           @update:is-valid="handleIsValid"
                                           @update:value="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
    .title-wrapper {
        width: 100%;
        .title {
            width: 100%;
            display: flex;
        }
    }
}

.toggle-box {
    text-align: right;
    width: 100%;
}

</style>
