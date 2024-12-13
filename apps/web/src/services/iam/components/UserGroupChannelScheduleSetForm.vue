<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PRadioGroup, PRadio, PI, PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { blue } from '@/styles/colors';

const state = reactive({
    settingMode: computed<MenuItem[]>(() => [
        {
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.WEEKDAYS'),
            name: 'weekdays',
        },
        {
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.EVERYDAY'),
            name: 'everyday',
        },
        {
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.CUSTOM'),
            name: 'custom',
        },
    ]),
    selectedSettingModeIdx: 0,
    days: computed<{key: string; name: string | TranslateResult;}[]>(() => [
        {
            key: 'monday',
            name: 'Mon',
        },
        {
            key: 'tuesday',
            name: 'Tue',
        },
        {
            key: 'wednesday',
            name: 'Wed',
        },
        {
            key: 'thursday',
            name: 'Thu',
        },
        {
            key: 'friday',
            name: 'Fri',
        },
        {
            key: 'saturday',
            name: 'Sat',
        },
        {
            key: 'sunday',
            name: 'Sun',
        },
    ]),
    selectedDays: [],
});

/* Component */
const handleChange = (idx: number) => {
    state.selectedSettingModeIdx = idx;
};
</script>

<template>
    <div class="flex flex-col bg-white border border-primary-3 rounded-md py-8 px-4">
        <p class="text-2xl">
            {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.TITLE') }}
        </p>
        <div>
            <p class="mt-4 text-sm font-bold">
                {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.SETTING_MODE') }}
            </p>
            <p-radio-group>
                <p-radio v-for="(mode, idx) in state.settingMode"
                         :key="idx"
                         v-model="state.selectedSettingModeIdx"
                         :value="idx"
                         @change="handleChange"
                >
                    {{ mode.label }}
                </p-radio>
            </p-radio-group>
            <div class="mt-2 flex items-center gap-0.5">
                <p-i :color="blue[600]"
                     name="ic_info-circle"
                     width="1rem"
                     height="1rem"
                />
                <span class="text-blue-600 text-xs">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.INFO') }}</span>
            </div>
            <div class="mt-4 flex gap-2">
                <p-select-button v-for="day in state.days"
                                 :key="day.key"
                                 v-model="state.selectedDays"
                                 multi-selectable
                                 :value="day"
                                 class="w-16"
                >
                    {{ day.name }}
                </p-select-button>
            </div>
            <div class="mt-4 flex items-center gap-2">
                <!--              TODO: need to update time list-->
                <p-select-dropdown />
                <span>to</span>
                <p-select-dropdown />
            </div>
        </div>
    </div>
</template>
