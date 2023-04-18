<template>
    <div ref="datePickerRef"
         class="p-datetime-picker"
         :class="{
             [styleType] : true,
             open : visiblePicker,
             'time-type': dataType === DATA_TYPE.time,
             invalid,
         }"
    >
        <div class="input-sizer">
            <input type="text"
                   :placeholder="dataType === DATA_TYPE.time ? $t('COMPONENT.DATETIME_PICKER.SELECT_TIME') : $t('COMPONENT.DATETIME_PICKER.SELECT_DATE')"
                   data-input
            >
        </div>
        <p-i :name="dataType === DATA_TYPE.time ? 'ic_alarm-clock' : 'ic_calendar'"
             color="inherit"
             data-toggle
             width="1.25rem"
             height="1.25rem"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Flatpickr from 'flatpickr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';

import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import type { DatetimePickerProps } from '@/inputs/datetime-picker/type';
import { DATA_TYPE, SELECT_MODE, STYLE_TYPE } from '@/inputs/datetime-picker/type';
import { i18n } from '@/translations';

import { getLocaleFile } from '@/translations/vendors/flatpickr';

import Instance = Flatpickr.Instance;


dayjs.extend(utc);
dayjs.extend(tz);

/**
 * Used library: flatpickr
 * https://flatpickr.js.org/
 */

const FLATPICKR_MODE = Object.freeze({
    single: 'single',
    multiple: 'multiple',
    range: 'range',
    time: 'time',
} as const);
type FlatpickrMode = typeof FLATPICKR_MODE[keyof typeof FLATPICKR_MODE];

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
            validator: (styleType) => Object.values(STYLE_TYPE).includes(styleType as string),
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        minDate: {
            type: [String, Date],
            default: undefined,
        },
        maxDate: {
            type: [String, Date],
            default: undefined,
        },
        selectMode: {
            type: String,
            default: SELECT_MODE.single,
            validator: (selectMode: any) => Object.values(SELECT_MODE).includes(selectMode),
        },
        dataType: {
            type: String,
            default: DATA_TYPE.yearToDate,
            validator: (dataType: any) => Object.values(DATA_TYPE).includes(dataType),
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: DatetimePickerProps, { emit }) {
        const state = reactive({
            datePickerRef: null as null | HTMLElement,
            datePicker: null as null | Instance,
            proxySelectedDates: useProxyValue<string[]>('selectedDates', props, emit),
            dateString: '',
            visiblePicker: false,
            plugins: computed(() => (props.dataType === DATA_TYPE.yearToMonth ? [
                monthSelectPlugin({
                    shorthand: false,
                    dateFormat: 'F Y',
                    altFormat: 'F Y',
                    theme: 'light',
                }),
            ] : [])),
            localeFile: computed(() => {
                // TODO:: use I18nConnector
                const localeFile = getLocaleFile(i18n.locale);
                if (localeFile) return { ...localeFile, rangeSeparator: ' ~ ' };
                return { rangeSeparator: ' ~ ' };
            }),
            mode: computed<FlatpickrMode>(() => {
                if (props.dataType === DATA_TYPE.time) return FLATPICKR_MODE.time;
                if (props.dataType === DATA_TYPE.yearToMonth) return FLATPICKR_MODE.single;
                return props.selectMode as FlatpickrMode;
            }),
            enableTime: computed(() => props.dataType === DATA_TYPE.time || props.dataType === DATA_TYPE.yearToTime),
        });

        /* util */
        const resizeInputWidth = (dateString, instance) => {
            const inputSizer = instance.element.childNodes[0];
            inputSizer.dataset.value = dateString;
            inputSizer.style.minWidth = 'auto';
        };

        /* event */
        const handleReady = (selectedDates, dateString, instance: Flatpickr.Instance) => {
            const calendarContainer = instance.calendarContainer;
            if (calendarContainer) {
                calendarContainer.classList.add('p-datetime-picker-calendar');
            }

            if (selectedDates.length) {
                state.dateString = dateString;
                resizeInputWidth(dateString, instance);
            }
        };
        const handleUpdateValue = (selectedDates, dateString, instance) => {
            resizeInputWidth(dateString, instance);
        };
        const handleClosePicker = (selectedDates: Date[], dateStr, instance) => {
            if (props.selectMode !== SELECT_MODE.range || (props.selectMode === SELECT_MODE.range && selectedDates.length === 2)) {
                state.proxySelectedDates = selectedDates.map((d) => {
                    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
                    return dayjs.tz(dateString, props.timezone).format();
                });
                state.dateString = dateStr;
            } else {
                // init selectedDates
                state.proxySelectedDates = props.selectedDates;
                if (state.datePicker) state.datePicker.setDate(props.selectedDates);
            }
            state.visiblePicker = false;
            resizeInputWidth(state.dateString, instance);
            emit('close');
        };
        const handleOpenPicker = () => {
            state.visiblePicker = true;
        };

        /* util */
        const createDatePicker = (datePickerRef: HTMLElement) => {
            if (props.dataType === DATA_TYPE.time) {
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: state.mode,
                    dateFormat: 'H:i',
                    enableTime: true,
                    wrap: true,
                    locale: state.localeFile,
                    onReady: handleReady,
                    onValueUpdate: handleUpdateValue,
                    onOpen: handleOpenPicker,
                    onClose: handleClosePicker,
                });
            } else {
                let defaultDate;
                if (state.proxySelectedDates.length) {
                    if (props.dataType === DATA_TYPE.yearToMonth) {
                        defaultDate = state.proxySelectedDates.map((d) => Flatpickr.formatDate(dayjs(d).tz(props.timezone).toDate(), 'F Y'));
                    } else {
                        defaultDate = state.proxySelectedDates.map((d) => dayjs(d).tz(props.timezone).format('YYYY-MM-DD HH:mm'));
                    }
                }
                state.datePicker = Flatpickr(datePickerRef, {
                    mode: state.mode,
                    defaultDate,
                    altInput: true,
                    altFormat: state.enableTime ? 'Y/m/d H:i' : 'Y/m/d',
                    dateFormat: state.enableTime ? 'Y/m/d H:i' : 'Y/m/d',
                    enableTime: state.enableTime,
                    minDate: props.minDate,
                    maxDate: props.maxDate,
                    wrap: true,
                    locale: state.localeFile,
                    onReady: handleReady,
                    onValueUpdate: handleUpdateValue,
                    onOpen: handleOpenPicker,
                    onClose: handleClosePicker,
                    plugins: state.plugins,
                });
            }
        };

        watch(() => state.datePickerRef, (datePickerRef) => {
            if (datePickerRef) {
                createDatePicker(datePickerRef);
            }
        });
        watch([() => props.selectedDates, () => props.minDate, () => props.maxDate, () => state.enableTime, () => state.localeFile], () => {
            if (state.datePickerRef) createDatePicker(state.datePickerRef);
        });

        return {
            ...toRefs(state),
            DATA_TYPE,
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

    /* active */
    &:hover,
    &.open,
    &:focus-within {
        @apply text-secondary border-secondary;
        cursor: pointer;
    }

    /* invalid */
    &.invalid {
        @apply border-red-500;
        color: initial;

        &.text {
            @apply text-red-500;
        }
    }

    /* data-type = time */
    &.time-type {
        width: 8rem;
    }

    /* style-type = text */
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

/* calendar */
.p-datetime-picker-calendar {
    &.flatpickr-calendar {
        margin-top: -0.125rem;
        &:not(.hasTime):not(.flatpickr-monthSelect-theme-light) {
            width: 15rem;
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
        &.flatpickr-monthSelect-theme-light {
            width: 23.375rem;
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
            @apply text-blue-600 bg-blue-100 border-blue-100;
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
            @apply bg-blue-600 border-blue-600 text-white;
            &.inRange, &:focus, &:hover, &.prevMonthDay, &.nextMonthDay {
                @apply bg-blue-600 border-blue-600 text-white;
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
    .flatpickr-monthSelect-months {
        display: grid;
        grid: repeat(4, 2rem) / repeat(3, 1fr);
        gap: 0.25rem 0.5rem;
        .flatpickr-monthSelect-month {
            @apply border border-gray-300 rounded-md;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.875rem;
            &:hover, :focus {
                @apply bg-blue-200;
            }
            &.selected {
                @apply border-secondary bg-secondary text-white;
            }
            &.disabled {
                @apply text-gray-300;
            }
        }
    }
}

.rangeMode .flatpickr-day {
    margin-top: 0.25rem;
}
</style>
