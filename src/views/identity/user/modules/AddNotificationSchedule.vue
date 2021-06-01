<template>
    <div>
        <p-radio v-for="(item, i) in scheduleMode" :key="i"
                 :selected="item.value" :value="selectedScheduleMode" class="mr-4"
                 @click="changeScheduleMode(item.value)"
        >
            <span class="radio-label" @click="changeScheduleMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="selectedScheduleMode === SCHEDULE_MODE.CUSTOM" class="schedule-wrapper">
            <info-message style-type="secondary"
                          :message="$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE_INFO_MSG')"
                          block
            />
            <h5 class="setting">
                {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
            </h5>
            <p-select-button v-for="day in weekDay" :key="day.value"
                             v-model="selectedDay"
                             multi-selectable
                             :value="day.value"
                             class="select-button-wrapper"
            >
                {{ day.label }}
            </p-select-button>
            <div class="dropdown-wrapper">
                <p-select-dropdown v-model="startTime"
                                   :items="timeList"
                                   class="dropdown"
                />
                <span class="text">to</span>
                <p-select-dropdown v-model="endTime"
                                   :items="timeList"
                                   class="dropdown"
                />
                <span class="timezone-text">{{ $t('COMMON.PROFILE.TIMEZONE') }}: {{ timezone }}</span>
            </div>
        </article>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PRadio, PSelectButton, PSelectDropdown } from '@spaceone/design-system';
import InfoMessage from '@/common/components/InfoMessage.vue';
import { range } from 'lodash';
import { store } from '@/store';

enum SCHEDULE_MODE {
    ALL = 'all',
    CUSTOM = 'custom',
}

const TIME_LIST = range(24);


export default {
    name: 'AddNotificationSchedule',
    components: {
        PRadio,
        PSelectButton,
        InfoMessage,
        PSelectDropdown,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            scheduleMode: computed(() => [{
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME'), value: 'all',
            }, {
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.CUSTOM'), value: 'custom',
            }]),
            selectedScheduleMode: 'all',
            weekDay: [{ label: 'Monday', value: 'MON' }, { label: 'Tuesday', value: 'TUE' }, { label: 'Wednesday', value: 'WED' },
                { label: 'Thursday', value: 'THU' }, { label: 'Friday', value: 'FRI' },
                { label: 'Saturday', value: 'SAT' },
                { label: 'Sunday', value: 'SUN' }],
            selectedDay: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
            timeList: TIME_LIST.map(d => ({
                type: 'item', label: `${d}:00`, name: d,
            })),
            startTime: 9,
            endTime: 18,
            timezone: computed(() => store.state.user.timezone),
        });
        const changeScheduleMode = (value) => {
            state.selectedScheduleMode = value;
        };

        return {
            SCHEDULE_MODE,
            ...toRefs(state),
            changeScheduleMode,
        };
    },
};
</script>

<style lang="postcss" scoped>
.radio-label {
    font-size: 0.875rem;
    line-height: 150%;
}
.schedule-wrapper {
    margin-top: 1.25rem;
    .setting {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 1.125rem;
    }
}
.select-button-wrapper {
    margin-right: 0.5rem;
    margin-bottom: 1rem;
}
.dropdown-wrapper {
    display: flex;
    align-items: center;
    .text {
        @apply mx-2;
        font-size: 0.875rem;
        line-height: 160%;
    }
    .timezone-text {
        @apply text-gray-600;
        margin-left: 1rem;
        font-size: 0.75rem;
        line-height: 150%;
    }
}
</style>
