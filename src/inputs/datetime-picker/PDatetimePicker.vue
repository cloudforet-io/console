<template>
    <div ref="datePickerRef" class="p-datetime-picker">
        <input type="text"
               :placeholder="placeholder"
               data-input
        >
        <p-i :name="mode === FLATPICKR_MODE.time ? 'ic_clock' : 'ic_calendar'"
             color="inherit"
             data-toggle
        />
    </div>
</template>

<script lang="ts">
import Flatpickr from 'flatpickr';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import { DatetimePicker, FLATPICKR_MODE, STYLE_TYPE } from '@/inputs/datetime-picker/type';
import { makeOptionalProxy } from '@/util/composition-helpers';

import Instance = Flatpickr.Instance;

dayjs.extend(utc);
dayjs.extend(tz);

/**
 * Used library: flatpickr
 * https://flatpickr.js.org/
 */

export default {
    name: 'PDatetimePicker',
    components: {
        PI,
    },
    model: {
        prop: 'selectedDates',
        event: 'update:selectedDates',
    },
    props: {
        selectedDates: {
            type: Array,
            default: () => ([]),
        },
        styleType: {
            type: String,
            default: STYLE_TYPE.default,
            validator: value => Object.values(STYLE_TYPE).includes(value as string),
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        /* Flatpickr */
        mode: {
            type: String,
            default: FLATPICKR_MODE.single,
            validator: value => Object.values(FLATPICKR_MODE).includes(value as string),
        },
        enableTime: {
            type: Boolean,
            default: false,
        },
        minDate: {
            type: [String, Date],
            default: undefined,
        },
        maxDate: {
            type: [String, Date],
            default: undefined,
        },
    },
    setup(props: DatetimePicker) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            datePickerRef: null as null | HTMLElement,
            datePicker: null as null | Instance,
            proxySelectedDates: makeOptionalProxy<string[]>('selectedDates', vm, props.selectedDates),
            placeholder: computed(() => {
                if (props.mode === FLATPICKR_MODE.time) {
                    // return vm.$t('DATETIME_PICKER.SELECT_TIME');
                    return 'Select Time';
                }
                // return vm.$t('DATETIME_PICKER.SELECT_DATE');
                return 'Select Date';
            }),
            offsetHours: computed(() => (dayjs().tz(props.timezone).utcOffset()) / 60),
        });

        /* event */
        const handleChangeInput = (selectedDates, dateString: string) => {
            const dateStringList = dateString.split(', ');
            state.proxySelectedDates = dateStringList.map((d) => {
                const timezoneDate = dayjs.utc(d).utcOffset(state.offsetHours, true);
                return timezoneDate.format();
            });
        };

        /* util */
        const createDatePicker = (datePickerRef: HTMLElement) => {
            if (props.mode === FLATPICKR_MODE.time) {
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: props.mode,
                    dateFormat: 'H:i',
                    enableTime: true,
                    wrap: true,
                    onValueUpdate: handleChangeInput,
                });
            } else {
                let defaultDate;
                if (state.proxySelectedDates.length) {
                    if (props.timezone === 'UTC') {
                        defaultDate = dayjs.utc(state.proxySelectedDates[0]).format('YYYY-MM-DD HH:mm');
                    } else {
                        defaultDate = dayjs(state.proxySelectedDates[0]).tz(props.timezone).format('YYYY-MM-DD HH:mm');
                    }
                }
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: props.mode,
                    defaultDate,
                    altInput: true,
                    altFormat: props.enableTime ? 'Y/m/d H:i' : 'Y/m/d',
                    dateFormat: 'Y-m-d H:i',
                    enableTime: props.enableTime,
                    minDate: props.minDate,
                    maxDate: props.maxDate,
                    wrap: true,
                    onValueUpdate: handleChangeInput,
                });
            }
        };

        watch(() => state.datePickerRef, (datePickerRef) => {
            if (datePickerRef) {
                createDatePicker(datePickerRef);
            }
        });

        return {
            ...toRefs(state),
            FLATPICKR_MODE,
        };
    },
};
</script>

<style lang="postcss">
@import 'flatpickr/dist/flatpickr.css';

.p-datetime-picker {
    @apply bg-white border border-gray-300 rounded text-gray-dark;
    display: flex;
    width: 13.375rem;
    height: 2rem;
    cursor: pointer;

    &:hover, &:focus {
        @apply border-secondary;
    }

    input {
        @apply rounded;
        width: 100%;
        height: 100%;
    }
}
</style>
