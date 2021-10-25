import flatpickr from 'flatpickr';

import FlatpickrOptions = flatpickr.Options.Options;

export const FLATPICKR_MODE = Object.freeze({
    single: 'single',
    multiple: 'multiple',
    range: 'range',
    time: 'time',
});

export const STYLE_TYPE = Object.freeze({
    default: 'default',
    text: 'text',
});
type STYLE_TYPE = typeof STYLE_TYPE[keyof typeof STYLE_TYPE]


export interface DatetimePicker extends FlatpickrOptions{
    selectedDates: string[];
    styleType: STYLE_TYPE;
    timezone: string;
}
