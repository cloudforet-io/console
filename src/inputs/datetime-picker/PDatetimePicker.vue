<template>
    <div ref="datePickerRef" class="p-datetime-picker"
         :class="{
             [mode] : true,
             [styleType] : true,
             open : visiblePicker,
         }"
    >
        <div class="input-sizer">
            <input type="text"
                   :placeholder="placeholder"
                   data-input
            >
        </div>
        <p-i :name="mode === FLATPICKR_MODE.time ? 'ic_clock' : 'ic_calendar'"
             color="inherit"
             data-toggle
             width="1.25rem"
             height="1.25rem"
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
            dateString: '',
            placeholder: computed(() => {
                if (props.mode === FLATPICKR_MODE.time) {
                    return vm.$t('COMPONENT.DATETIME_PICKER.SELECT_TIME');
                }
                return vm.$t('COMPONENT.DATETIME_PICKER.SELECT_DATE');
            }),
            offsetHours: computed(() => (dayjs().tz(props.timezone).utcOffset()) / 60),
            visiblePicker: false,
        });

        /* util */
        const resizeInputWidth = (dateString, instance) => {
            const inputSizer = instance.element.childNodes[0];
            inputSizer.dataset.value = dateString;
            inputSizer.style.minWidth = 'auto';
        };

        /* event */
        const handleReady = (selectedDates, dateString, instance) => {
            if (selectedDates.length) {
                state.dateString = dateString;
                resizeInputWidth(dateString, instance);
            }
        };
        const handleUpdateValue = (selectedDates, dateString, instance) => {
            resizeInputWidth(dateString, instance);
        };
        const handleClosePicker = (selectedDates: Date[], dateStr, instance) => {
            if (props.mode !== FLATPICKR_MODE.range || (props.mode === FLATPICKR_MODE.range && selectedDates.length === 2)) {
                state.proxySelectedDates = selectedDates.map((d) => {
                    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
                    const timezoneDate = dayjs.utc(dateString).utcOffset(state.offsetHours, true);
                    return timezoneDate.format();
                });
                state.dateString = dateStr;
            } else {
                state.proxySelectedDates = props.selectedDates;
                if (state.datePicker) state.datePicker.setDate(props.selectedDates);
            }
            state.visiblePicker = false;
            resizeInputWidth(state.dateString, instance);
        };
        const handleOpenPicker = () => {
            state.visiblePicker = true;
        };

        /* util */
        const createDatePicker = (datePickerRef: HTMLElement) => {
            if (props.mode === FLATPICKR_MODE.time) {
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: props.mode,
                    dateFormat: 'H:i',
                    enableTime: true,
                    wrap: true,
                    locale: {
                        rangeSeparator: ' ~ ',
                    },
                    onReady: handleReady,
                    onValueUpdate: handleUpdateValue,
                    onOpen: handleOpenPicker,
                    onClose: handleClosePicker,
                });
            } else {
                let defaultDate;
                if (state.proxySelectedDates.length) {
                    if (props.timezone === 'UTC') {
                        defaultDate = state.proxySelectedDates.map(d => dayjs.utc(d).format('YYYY-MM-DD HH:mm'));
                    } else {
                        defaultDate = state.proxySelectedDates.map(d => dayjs(d).tz(props.timezone).format('YYYY-MM-DD HH:mm'));
                    }
                }
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: props.mode,
                    defaultDate,
                    altInput: true,
                    altFormat: props.enableTime ? 'Y/m/d H:i' : 'Y/m/d',
                    dateFormat: props.enableTime ? 'Y/m/d H:i' : 'Y/m/d',
                    enableTime: props.enableTime,
                    minDate: props.minDate,
                    maxDate: props.maxDate,
                    wrap: true,
                    locale: {
                        rangeSeparator: ' ~ ',
                    },
                    onReady: handleReady,
                    onValueUpdate: handleUpdateValue,
                    onOpen: handleOpenPicker,
                    onClose: handleClosePicker,
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
    @apply overflow-hidden bg-white border border-gray-300 rounded text-gray-dark rounded;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    width: 13.375rem;
    height: 2rem;
    padding-right: 0.5rem;
    font-size: 0.875rem;
    letter-spacing: -0.01rem;
    &:hover,
    &.open,
    &:focus-within {
        @apply text-secondary border-secondary;
        cursor: pointer;
    }
    .input-sizer {
        width: 100%;
        height: 100%;
    }
    input {
        width: 100%;
        height: 100%;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-left: 0.5rem;
        cursor: pointer;
        &::placeholder {
            @apply text-gray-300;
        }
        &:focus {
            outline: none;
        }
    }
    .p-i-icon {
        flex-shrink: 0;
        margin-left: 0.5rem;
    }
    &.time {
        width: 8rem;
    }
    &.text:not(.open.time) {
        @apply border-0 bg-transparent;
        width: auto;
        max-width: 18rem;
        padding-right: 0;
        .input-sizer {
            display: inline-block;
            position: relative;
            min-width: 5.125rem;
            width: fit-content;
            &::after {
                content: attr(data-value) ' ';
                visibility: hidden;
            }
            input {
                @apply bg-transparent;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                padding-left: 0;
            }
        }
    }
}
.flatpickr-calendar {
    width: 15rem;
    margin-top: -0.125rem;
    &:not(.hasTime) {
        min-height: 16.375rem;
    }
    &::before, &::after {
        display: none;
    }
    &.open {
        @apply overflow-hidden border-secondary;
        box-shadow: none;
        border-width: 0.0625rem;
        border-style: solid;
    }
    &.hasTime {
        input, .numInputWrapper, .flatpickr-am-pm {
            &:hover {
                @apply bg-blue-100;
                cursor: pointer;
            }
            &:focus {
                @apply bg-blue-200;
                cursor: pointer;
            }
        }
        .numInputWrapper span {
            @apply border-gray-200 bg-blue-100;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 0.75rem;
            padding: 0;
            &:hover {
                @apply bg-blue-100;
            }
            &.arrowUp::after {
                border-style: solid;
                border-width: 0 0.125rem 0.25rem 0.125rem;
                top: 40%;
            }
            &.arrowDown::after {
                border-style: solid;
                border-width: 0.25rem 0.125rem 0 0.125rem;
            }
        }
        &.noCalendar {
            width: 8rem;
            .flatpickr-time {
                border-top: none;
                .numInputWrapper {
                    width: calc((100% - 0.25rem - 2.5rem) / 2);
                }
                .flatpickr-time-separator {
                    width: 0.25rem;
                }
                .flatpickr-am-pm {
                    width: 2.5rem;
                }
            }
        }
    }
}
.flatpickr-months {
    position: relative;
    padding: 0.5rem 0.5rem 0.25rem;
    .flatpickr-month {
        @apply text-gray-900;
    }
    .flatpickr-prev-month, .flatpickr-next-month {
        display: flex;
        align-items: center;
        padding: 0;
        margin: 0.5rem;
        &:hover svg {
            fill: theme('colors.secondary');
        }
    }
    .flatpickr-current-month {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 1rem;
        .flatpickr-monthDropdown-months {
            padding: 0;
            margin: 0 0.5rem 0 0;
            &:hover {
                @apply bg-transparent;
            }
            input {
                margin: 0 0.5rem 0 0;
            }
        }
        .numInputWrapper {
            padding: 0;
            &:hover {
                @apply bg-transparent;
            }
            .cur-year {
                padding: 0 1rem 0 0;
            }
        }
    }
}
.flatpickr-innerContainer {
    padding: 0 0.5rem 0.5rem;
    .flatpickr-rContainer {
        width: 100%;
        .flatpickr-weekday {
            @apply text-gray-400 font-bold;
            font-size: 0.625rem;
        }
        .flatpickr-days {
            width: 100%;
            .dayContainer {
                min-width: 100%;
                max-width: 100%;
            }
        }
    }
}
.flatpickr-day {
    @apply text-gray-700;
    width: 2rem;
    height: 2rem;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    line-height: 2rem;
    &:hover:not(.selected):not(.today):not(.prevMonthDay):not(.nextMonthDay):not(.inRange):not(.startRange):not(.endRange):not(.flatpickr-disabled) {
        @apply text-blue-500 bg-blue-100 border-blue-100;
    }
    &.today:not(.flatpickr-disabled):not(.today) {
        @apply border-gray-400;
    }
    &.inRange {
        @apply bg-blue-200 border-blue-200;
        box-shadow: none;
        &.prevMonthDay, &.nextMonthDay, &.today {
            @apply bg-blue-200 border-blue-200;
            box-shadow: none;
        }
    }
    &.selected, &.startRange, &.endRange {
        @apply bg-blue-500 border-blue-500 text-white;
        &.inRange, &:focus, &:hover, &.prevMonthDay, &.nextMonthDay {
            @apply bg-blue-500 border-blue-500 text-white;
        }
    }
    &.startRange {
        &.selected, &.startRange, &.endRange {
            & + .endRange:not(:nth-child(7n+1)) {
                box-shadow: none;
            }
        }
    }
}
.rangeMode .flatpickr-day {
    margin-top: 0.25rem;
}
</style>
