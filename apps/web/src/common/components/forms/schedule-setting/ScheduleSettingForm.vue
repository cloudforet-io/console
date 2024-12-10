<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { range } from 'lodash';

import {
    PFieldGroup, PRadioGroup, PRadio, PI, PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import type {
    ScheduleDayButtonType,
    ScheduleRadioType,
    ScheduleType,
    ScheduleDayType,
    ScheduleForm,
} from '@/common/components/forms/schedule-setting/type';

import { blue } from '@/styles/colors';

const emit = defineEmits<{(e: 'schedule-form', form: ScheduleForm): void; }>();

const state = reactive({
    scheduleTypeList: computed<ScheduleRadioType[]>(() => [
        { name: 'WEEK_DAY', label: i18n.t('COMMON.SCHEDULE_SETTING.WEEKDAYS') },
        { name: 'ALL_DAY', label: i18n.t('COMMON.SCHEDULE_SETTING.EVERYDAY') },
        { name: 'CUSTOM', label: i18n.t('COMMON.SCHEDULE_SETTING.CUSTOM') },
    ]),
    selectedRadioIdx: 0,
    days: computed<ScheduleDayButtonType[]>(() => [
        { name: 'MON', label: i18n.t('COMMON.SCHEDULE_SETTING.MON') },
        { name: 'TUE', label: i18n.t('COMMON.SCHEDULE_SETTING.TUE') },
        { name: 'WED', label: i18n.t('COMMON.SCHEDULE_SETTING.WED') },
        { name: 'THU', label: i18n.t('COMMON.SCHEDULE_SETTING.THU') },
        { name: 'FRI', label: i18n.t('COMMON.SCHEDULE_SETTING.FRI') },
        { name: 'SAT', label: i18n.t('COMMON.SCHEDULE_SETTING.SAT') },
        { name: 'SUN', label: i18n.t('COMMON.SCHEDULE_SETTING.SUN') },
    ]),
    selectedDayButton: [] as ScheduleDayType[],
    start: 9,
    end: 18,
});

const generateHourlyTimeArray = () => range(0, 25).map((h) => ({
    label: `${h.toString().padStart(2, '0')}:00`,
    name: h,
}));

const handleSelectScheduleType = (type: ScheduleType) => {
    if (type === 'WEEK_DAY') {
        state.selectedDayButton = state.days.slice(0, 5).map((day) => day.name);
    } else if (type === 'ALL_DAY') {
        state.selectedDayButton = state.days.map((day) => day.name);
    } else {
        state.selectedDayButton = [];
    }
};
const handleSelectDayButton = (value: ScheduleDayType[]) => {
    state.selectedRadioIdx = 2;
    state.selectedDayButton = value;
};
const handleSelectDropdown = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
        state.start = value;
    } else {
        state.end = value;
    }
};

watch([() => state.selectedRadioIdx, () => state.selectedDayButton, () => state.start, () => state.end], ([selectedRadioIdx, selectedDayButton, start, end]) => {
    emit('schedule-form', {
        type: state.scheduleTypeList[selectedRadioIdx].name,
        days: selectedDayButton,
        start,
        end,
    });
}, { deep: true });

onMounted(() => {
    if (state.selectedRadioIdx === 0) {
        state.selectedDayButton = state.days.slice(0, 5).map((day) => day.name);
    }
});
</script>

<template>
    <div class="schedule-setting-form flex flex-col">
        <p-field-group :label="$t('COMMON.SCHEDULE_SETTING.SCHEDULE_SETTING')"
                       required
        >
            <p-radio-group direction="horizontal">
                <p-radio v-for="(item, index) in state.scheduleTypeList"
                         :key="`schedule-setting-${index}`"
                         v-model="state.selectedRadioIdx"
                         :value="index"
                         @change="handleSelectScheduleType(item.name)"
                >
                    {{ item.label }}
                </p-radio>
            </p-radio-group>
            <div class="flex gap-1 py-2 px-0.5">
                <p-i name="ic_info-circle"
                     :color="blue[600]"
                     width="0.875rem"
                     height="0.875rem"
                />
                <p class="text-xs text-blue-600">
                    {{ $t('COMMON.SCHEDULE_SETTING.INFO') }}
                </p>
            </div>
            <div class="w-full overflow py-4 flex flex-wrap gap-2">
                <p-select-button v-for="(item, index) in state.days"
                                 :key="`schedule-days-${index}`"
                                 v-model="state.selectedDayButton"
                                 multi-selectable
                                 :value="item.name"
                                 @change="handleSelectDayButton"
                >
                    {{ item.label }}
                </p-select-button>
            </div>
            <div class="flex items-center gap-2">
                <p-select-dropdown :menu="generateHourlyTimeArray()"
                                   placeholder="9:00"
                                   @select="handleSelectDropdown('start', $event)"
                />
                <span>{{ $t('COMMON.SCHEDULE_SETTING.TO') }}</span>
                <p-select-dropdown :menu="generateHourlyTimeArray()"
                                   placeholder="18:00"
                                   @select="handleSelectDropdown('end', $event)"
                />
            </div>
        </p-field-group>
    </div>
</template>
