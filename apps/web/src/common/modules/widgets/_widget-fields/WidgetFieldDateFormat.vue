<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import { PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { getFormattedDate } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
    DateFormatOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { DateFormatValue } from '@/common/modules/widgets/types/widget-field-value-type';

const BIRTHDAY_OF_WONNY = '2020-01-29';
const AUTO_DISPLAY_BY_GRANULARITY = 'Auto display by granularity';
const AUTO_DISPLAY_EXMAPLE_TEXT = '01 or 09 or 2020';

const DATE_FORMAT_LABEL_MAP = {
    'Auto display by granularity': i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_FORMAT_AUTO_DISPLAY'),
};

const props = defineProps<WidgetFieldComponentProps<DateFormatOptions, DateFormatValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<DateFormatValue>>();
const state = reactive({
    menuItems: computed<MenuItem[]>(() => Object.keys(DATE_FORMAT).map((d) => ({
        name: d,
        label: DATE_FORMAT_LABEL_MAP[d] ?? d,
    }))),
    proxyValue: useProxyValue('value', props, emit),
    selectedMenuItem: props.value?.value ?? props.widgetConfig?.optionalFieldsSchema.dateFormat?.options?.default ?? Object.keys(DATE_FORMAT)[0] as undefined | MenuItem[] | string,
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedMenuItem = val;
    state.proxyValue = {
        value: val,
    };
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = {
        value: props.value?.value ?? props.widgetConfig?.optionalFieldsSchema.dateFormat?.options?.default ?? Object.keys(DATE_FORMAT)[0],
    };
});


</script>

<template>
    <div class="widget-date-format">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_FORMAT')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.selectedMenuItem"
                               use-fixed-menu-style
                               @update:selected="handleUpdateSelect"
            >
                <template #menu-item--format="{item}">
                    <span class="menu-item">{{ item.label }}
                        <span v-if="item.name === AUTO_DISPLAY_BY_GRANULARITY"
                              class="example"
                        >
                            {{ AUTO_DISPLAY_EXMAPLE_TEXT }}
                        </span>
                        <span v-else
                              class="example"
                        >{{ getFormattedDate(BIRTHDAY_OF_WONNY, DATE_FORMAT[item.name].DAILY) }}</span>
                    </span>
                </template>
            </p-select-dropdown>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.widget-date-format {
    .menu-item {
        @apply flex items-center justify-between;
        .example {
            @apply text-label-sm text-gray-500;
            margin-left: 0.25rem;
        }
    }
}
</style>
