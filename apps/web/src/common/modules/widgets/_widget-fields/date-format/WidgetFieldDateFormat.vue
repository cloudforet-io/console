<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { getFormattedDate } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    DateFormatOptions,
    DateFormatValue,
} from '@/common/modules/widgets/_widget-fields/date-format/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const BIRTHDAY_OF_WONNY = '2020-01-29';
const AUTO_DISPLAY_BY_GRANULARITY = 'Auto display by granularity';
const AUTO_DISPLAY_EXMAPLE_TEXT = '01 or 09 or 2020';

const DATE_FORMAT_LABEL_MAP = {
    'Auto display by granularity': i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_FORMAT_AUTO_DISPLAY'),
};
const FIELD_KEY = 'dateFormat';

const props = defineProps<_WidgetFieldComponentProps<DateFormatOptions>>();
const state = reactive({
    fieldValue: computed<DateFormatValue>(() => props.fieldManager.data[FIELD_KEY].value),
    menuItems: computed<MenuItem[]>(() => Object.keys(DATE_FORMAT).map((d) => ({
        name: d,
        label: DATE_FORMAT_LABEL_MAP[d] ?? d,
    }))),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    props.fieldManager.setFieldValue(FIELD_KEY, { format: val });
};

</script>

<template>
    <div class="widget-date-format">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_FORMAT')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.fieldValue.format"
                               use-fixed-menu-style
                               block
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

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
