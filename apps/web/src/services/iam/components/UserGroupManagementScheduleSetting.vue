<script lang="ts" setup>
import { ref } from 'vue';

import {
    PFieldGroup, PRadioGroup, PRadio, PI, PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

const SCHEDULE_SETTING_LIST = [
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.WEEKDAYS'),
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.EVERYDAY'),
    i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.CUSTOM'),
];

const DAYS: MenuItem[] = [
    {
        name: 'Monday',
        label: 'Mon',
    },
    {
        name: 'Tuesday',
        label: 'Tue',
    },
    {
        name: 'Wednesday',
        label: 'Wed',
    },
    {
        name: 'Thursday',
        label: 'Thu',
    },
    {
        name: 'Friday',
        label: 'Fri',
    },
    {
        name: 'Saturday',
        label: 'Sat',
    },
    {
        name: 'Sunday',
        label: 'Sun',
    },
];

const selectedDays = ref<string[]>([]);
</script>

<template>
    <div class="user-group-schedule-setting-wrapper">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.SCHEDULE_SETTING')"
                       required
        >
            <p-radio-group direction="horizontal">
                <p-radio v-for="(schedule_setting, i) in SCHEDULE_SETTING_LIST"
                         :key="i"
                >
                    {{ schedule_setting }}
                </p-radio>
            </p-radio-group>
            <div class="flex gap-1 py-2 px-0.5">
                <p-i name="ic_info-circle"
                     color="#007EE5"
                     width="14px"
                     height="14px"
                />
                <p class="text-xs text-blue-600">
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.INFO') }}
                </p>
            </div>
            <div class="w-full overflow py-4 flex flex-wrap gap-2">
                <p-select-button v-for="(selectedDay, i) in DAYS"
                                 :key="`${selectedDay}-${i}`"
                                 v-model="selectedDays"
                                 multi-selectable
                                 :value="selectedDay.name"
                >
                    <!--                                 @change="handleUpdateDays(selectedDay)"-->
                    {{ selectedDay.label }}
                </p-select-button>
            </div>
            <div class="flex items-center gap-2">
                <p-select-dropdown :menu="[{name: 'nine', label: '9:00'}]"
                                   placeholder="9:00"
                />
                <span>to</span>
                <p-select-dropdown :menu="[{name: 'eighteen', label: '18:00'}]"
                                   placeholder="18:00"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.user-group-schedule-setting-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
}
</style>
