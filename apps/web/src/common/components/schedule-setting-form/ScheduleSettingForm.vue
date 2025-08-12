<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { map, range, zipObject } from 'lodash';

import {
    PFieldGroup, PRadioGroup, PRadio, PI, PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ServiceChannelScheduleType } from '@/api-clients/alert-manager/service-channel/schema/type';
import { i18n } from '@/translations';

import { timezoneList } from '@/store/user/constant';
import { useUserStore } from '@/store/user/user-store';

import type {
    ScheduleDayButtonType,
    ScheduleRadioType,
    DayType,
    ScheduleSettingFormType,
    ScheduleFormDayType,
} from '@/common/components/schedule-setting-form/schedule-setting-form';

import { blue } from '@/styles/colors';

interface Props {
    scheduleForm?: ScheduleSettingFormType;
}

const props = withDefaults(defineProps<Props>(), {
    scheduleForm: undefined,
});

const userStore = useUserStore();
const userState = userStore.state;

const emit = defineEmits<{(e: 'update-form', form: ScheduleSettingFormType): void; }>();

const storeState = reactive({
    timezone: props.scheduleForm?.TIMEZONE || userState.timezone || 'UTC',
});
const state = reactive({
    timezones: computed<SelectDropdownMenuItem[]>(() => map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    }))),
    timezone: [{ label: storeState.timezone, name: storeState.timezone }] as SelectDropdownMenuItem[],
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
    selectedDayButton: ['MON', 'TUE', 'WED', 'THU', 'FRI'] as DayType[],
    start: 0,
    end: 24,
    startHourTimeList: computed<SelectDropdownMenuItem[]>(() => range(0, state.end).map((h) => ({
        label: `${h.toString().padStart(2, '0')}:00`,
        name: h.toString(),
    }))),
    endHourTimeList: computed<SelectDropdownMenuItem[]>(() => range(Number(state.start) + 1, 25).map((h) => ({
        label: `${h.toString().padStart(2, '0')}:00`,
        name: h.toString(),
    }))),
    scheduleDayForm: computed<Record<DayType, ScheduleFormDayType>>(() => {
        const refinedDays = state.days.map((day) => ({
            is_scheduled: state.selectedDayButton.includes(day.name),
            start: state.start,
            end: state.end,
        }));
        return zipObject(state.days.map((i) => i.name), refinedDays) as Record<DayType, ScheduleFormDayType>;
    }),
});

const initScheduleForm = () => {
    if (!props.scheduleForm) return;
    state.selectedRadioIdx = state.scheduleTypeList.findIndex((item) => item.name === props.scheduleForm?.SCHEDULE_TYPE) || 0;

    let filteredSchedule: string[] = [];
    if (state.selectedRadioIdx === 0) {
        filteredSchedule = state.days.slice(0, 5).map((day) => day.name);
    } else if (state.selectedRadioIdx === 1) {
        filteredSchedule = state.days.map((day) => day.name);
    } else {
        filteredSchedule = state.days.filter((day) => {
            if (!props.scheduleForm) return [];
            const schedule = props.scheduleForm[day.name];
            return schedule?.is_scheduled;
        }).map((i) => i.name);
    }

    state.selectedDayButton = filteredSchedule;
    state.start = props.scheduleForm[filteredSchedule[0]]?.start || 0;
    state.end = props.scheduleForm[filteredSchedule[0]]?.end || 24;
};

const handleSelectScheduleType = (type: ServiceChannelScheduleType) => {
    if (type === 'WEEK_DAY') {
        state.selectedDayButton = state.days.slice(0, 5).map((day) => day.name);
    } else if (type === 'ALL_DAY') {
        state.selectedDayButton = state.days.map((day) => day.name);
    } else {
        state.selectedDayButton = [];
    }
};
const handleSelectDayButton = (value: DayType[]) => {
    state.selectedRadioIdx = 2;
    state.selectedDayButton = value;
};
const handleSelectDropdown = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
        state.start = value || 0;
    } else {
        state.end = value || 0;
    }
};

const areDayArraysEqual = (selectedDayButton: DayType[], compareDays: DayType[]) => {
    if (selectedDayButton.length !== compareDays.length) return false;
    const selectedDaySet = new Set(selectedDayButton);
    return compareDays.every((day) => selectedDaySet.has(day));
};


watch([() => state.selectedRadioIdx, () => state.selectedDayButton, () => state.start, () => state.end, () => state.timezone], ([selectedRadioIdx]) => {
    emit('update-form', {
        SCHEDULE_TYPE: state.scheduleTypeList[selectedRadioIdx].name,
        TIMEZONE: state.timezone[0]?.name,
        ...state.scheduleDayForm,
    });
}, { immediate: true });

watch(() => state.selectedDayButton, (selectedDayButton) => {
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as DayType[];
    const everyDay = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as DayType[];
    if (areDayArraysEqual(selectedDayButton, weekDays)) {
        state.selectedRadioIdx = 0;
    } else if (areDayArraysEqual(selectedDayButton, everyDay)) {
        state.selectedRadioIdx = 1;
    }
}, { immediate: true });

onMounted(() => {
    if (props.scheduleForm) {
        initScheduleForm();
    }
});
</script>

<template>
    <div class="schedule-setting-form flex flex-col">
        <p-field-group :label="$t('COMMON.SCHEDULE_SETTING.SET_TIMEZONE')"
                       required
                       class="flex flex-col"
        >
            <p-select-dropdown :menu="state.timezones"
                               :selected.sync="state.timezone"
                               :page-size="10"
                               is-filterable
                               is-fixed-width
                               show-delete-all-button
                               class="timezone-dropdown"
            />
        </p-field-group>
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
                <p-select-dropdown :menu="state.startHourTimeList"
                                   :selected="state.start"
                                   :placeholder="state.startHourTimeList[state.start].label"
                                   @select="handleSelectDropdown('start', $event)"
                />
                <span>{{ $t('COMMON.SCHEDULE_SETTING.TO') }}</span>
                <p-select-dropdown :menu="state.endHourTimeList"
                                   :selected="state.end"
                                   :placeholder="state.endHourTimeList[state.end - state.start - 1].label"
                                   @select="handleSelectDropdown('end', $event)"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.timezone-dropdown {
    width: 16.625rem;
}
</style>
