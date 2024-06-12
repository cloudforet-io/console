<script setup lang="ts">
import {
    computed,
    onMounted,
    reactive,
} from 'vue';

import {
    PDataLoader, PI,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import {
    getDateFormat,
    getTimeUnit,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps<Data>>();
const emit = defineEmits<WidgetEmit>();

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
    data: null as Data | null,
    previousValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _timeUnit = getTimeUnit(state.granularity);
        const _previousDate = dayjs.utc(state.basedOnDate).subtract(1, _timeUnit).format(_dateFormat);
        return state.data?.results.find((item) => item.Date === _previousDate)?.[state.dataField] ?? 0;
    }),
    currentValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _currentDate = dayjs.utc(state.basedOnDate).format(_dateFormat);
        return state.data?.results.find((item) => item.Date === _currentDate)?.[state.dataField] ?? 0;
    }),
    comparisonText: computed(() => {
        const _comparison = state.currentValue - state.previousValue;
        const _comparisonAbs = Math.abs(_comparison);
        let _text;
        if (_comparison < 0) {
            if (state.granularity === 'YEARLY') {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_YEAR');
            } else if (state.granularity === 'MONTHLY') {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_MONTH');
            } else {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_DAY');
            }
        } else if (state.granularity === 'YEARLY') {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_YEAR');
        } else if (state.granularity === 'MONTHLY') {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_MONTH');
        } else {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_DAY');
        }
        return `${numberFormatter(_comparisonAbs, { notation: 'compact' })} ${_text}`;
    }),
    //
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
});

/* Util */
const loadWidget = async (): Promise<Data|null> => {
    try {
        state.loading = true;
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 2);
        return await SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>({
            widget_id: 'public-widget-74bd848364d0',
            query: {
                granularity: state.granularity,
                start: _start,
                end: _end,
                group_by: ['Date'],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    } finally {
        state.loading = false;
    }
};

const initWidget = async (data?: Data) => {
    state.data = data ?? await loadWidget();
};

onMounted(async () => {
    await initWidget();
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <p-data-loader class="chart-loader"
                       :loading="state.loading"
                       loader-type="skeleton"
                       disable-empty-case
                       :loader-backdrop-opacity="1"
                       show-data-from-scratch
        >
            <div class="content-wrapper">
                <div class="top-part">
                    <div class="icon-wrapper">
                        <p-i name="ic_service_metric-explorer"
                             width="1.5rem"
                             height="1.5rem"
                             color="inherit"
                        />
                    </div>
                    <span class="value-text">{{ numberFormatter(state.currentValue, { notation: 'compact' }) }}</span>
                </div>
                <div class="comparison-wrapper">
                    <p-i :name="state.currentValue - state.previousValue < 0 ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                         width="1rem"
                         height="1rem"
                    />
                    <span>{{ state.comparisonText }}</span>
                </div>
            </div>
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .content-wrapper {
        height: 100%;
        .top-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .value-text {
                @apply text-display-xl;
            }
        }
        .comparison-wrapper {
            @apply text-label-sm;
        }
    }
}
</style>
