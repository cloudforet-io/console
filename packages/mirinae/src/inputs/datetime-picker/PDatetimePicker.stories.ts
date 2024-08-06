import {
    reactive, toRefs, computed, watch,
} from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import dayjs from 'dayjs';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getDatetimePickerArgs, getDatetimePickerParameters, getDatetimePickerArgTypes } from '@/inputs/datetime-picker/story-helper';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import { I18nConnector } from '@/translations';

import PDatetimePicker from './PDatetimePicker.vue';

type PDatetimePickerPropsAndCustomArgs = ComponentProps<typeof PDatetimePicker>;

const meta : Meta<PDatetimePickerPropsAndCustomArgs> = {
    title: 'Inputs/Datetime Picker',
    component: PDatetimePicker,
    argTypes: {
        ...getDatetimePickerArgTypes(),
    },
    parameters: {
        ...getDatetimePickerParameters(),
    },
    args: {
        ...getDatetimePickerArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDatetimePicker>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full overflow p-8">
            <p>select mode: {{ selectMode }}</p><br>
            <p-datetime-picker
                :selected-dates.sync="proxySelectedDates"
                :style-type="styleType"
                :min-date="minDate"
                :max-date="maxDate"
                :select-mode="selectMode"
                :data-type="dataType"
                :invalid="invalid"
                @update:selectedDates="onUpdateSelectedDates"
                @close="onClose"
            />
            <br>
            <p>Selected Dates: {{ proxySelectedDates }}</p>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySelectedDates: useProxyValue('selectedDates', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DefaultDatetimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <p-datetime-picker />
        `,
    }),
};

export const InvalidDatetimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <table style="border-collapse: separate; border-spacing: 16px;">
            <tr>
                <td><p-datetime-picker invalid :selected-dates.sync="selectedDates" /></td>
                <td><p-datetime-picker invalid style-type="text" :selected-dates.sync="selectedDates" /></td>
            </tr>
            <tr>
                <td><p-datetime-picker invalid data-type="yearToTime" :selected-dates.sync="selectedDates" /></td>
                <td><p-datetime-picker invalid data-type="yearToTime" style-type="text" :selected-dates.sync="selectedDates" /></td>
            </tr>
            <tr>
                <td><p-datetime-picker invalid data-type="time" /></td>
                <td><p-datetime-picker invalid data-type="time" style-type="text" /></td>
            </tr>
            </table>
        `,
        setup() {
            const state = reactive({
                selectedDates: ['2021-10-01T00:00:00+09:00'],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DefaultWithTimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <p-datetime-picker data-type="yearToTime" />
        `,
    }),
};

export const DefaultWithMinDateandMaxDate: Story = {
    render: () => ({
        components: { PDatetimePicker, PSelectDropdown },
        i18n: I18nConnector.i18n,
        template: `
            <div>
            <p class="py-2">Select dataType.</p>
            <p-select-dropdown :selected.sync="selectedDataType" :menu="menu"/>
            <p class="py-2">Min Date = Today</p>
            <p-datetime-picker v-model="start" :min-date="now" :data-type="selectedDataType" />
            <p class="py-2">Max Date = Today</p>
            <p-datetime-picker v-model="end" :max-date="now" :data-type="selectedDataType" />
            </div>
        `,
        setup() {
            const state = reactive({
                menu: [
                    { name: 'yearToDate', label: 'yearToDate' },
                    { name: 'yearToMonth', label: 'yearToMonth' },
                ],
                selectedDataType: 'yearToDate',
                start: [],
                end: [],
                now: computed(() => {
                    if (state.selectedDataType === 'yearToDate') {
                        return dayjs.utc().format('YYYY-MM-DD');
                    }
                    return dayjs.utc().format('YYYY-MM');
                }),
            });
            watch(() => state.selectedDataType, () => {
                state.start = [];
                state.end = [];
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const TextStyleDatetimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <p-datetime-picker style-type="text" select-mode="range" :selected-dates.sync="selectedDates" />
        `,
        setup() {
            const state = reactive({
                selectedDates: ['2021-11-01T00:00:00Z', '2021-11-02T09:49:30Z'],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultipleSelectionModeDatetimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <p-datetime-picker select-mode="multiple" />
        `,
    }),
};

export const RangeSelectionModeDatetimePicker: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <div>
            <p-datetime-picker select-mode="range" :selected-dates.sync="selectedDates" />
            <p class="pt-2">{{ selectedDates }}</p>
            </div>
        `,
        setup() {
            const state = reactive({
                selectedDates: [
                    dayjs.utc().startOf('month').format(),
                    dayjs.utc().format(),
                ],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const TimeOnlySelection: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <div>
            <p-datetime-picker data-type="time" :selected-dates.sync="selectedDates" />
            <p class="pt-2">{{ selectedDates }}</p>
            </div>
        `,
        setup() {
            const state = reactive({
                selectedDates: [],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const YearandMonthSelection: Story = {
    render: () => ({
        components: { PDatetimePicker },
        i18n: I18nConnector.i18n,
        template: `
            <div>
            <p-datetime-picker data-type="yearToMonth" :selected-dates.sync="selectedDates" />
            <p class="pt-2">{{ selectedDates }}</p>
            </div>
        `,
        setup() {
            const state = reactive({
                selectedDates: [],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
