<template>
    <div class="top5-project-activity-tooltip"
         :class="status"
    >
        <div class="tooltip-title-wrapper">
            <span class="title"><b>{{ $t('MONITORING.ALERT.DASHBOARD.ALERT') }}</b> ({{ totalCount }})</span>
            <span class="date">{{ dateFormatter(date) }}</span>
            <div class="alert-item-wrapper">
                <p v-for="(alert, idx) in alerts"
                   :key="`${projectId}-${date}-${idx}`"
                   class="alert-item"
                >
                    <p-i :name="alert.urgency === 'HIGH' ? 'ic_error-filled' : 'ic_warning-filled'"
                         width="0.75rem"
                         height="0.75rem"
                         :color="alert.urgency === 'HIGH' ? red[400] : red[300]"
                    />
                    <span class="title"
                          :class="{'urgency-high': alert.urgency === 'HIGH'}"
                    >{{ alert.title }}</span>
                </p>
            </div>
            <p v-if="moreCount">
                {{ moreCount }} {{ $t('MONITORING.ALERT.DASHBOARD.MORE_ALERTS_HELP_TEXT') }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import {
    onMounted, reactive, toRefs, computed,
} from 'vue';

import {
    PI,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';


export default {
    name: 'Top5ProjectActivityTooltip',
    components: {
        PI,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        status: {
            type: String,
            default: undefined,
        },
        date: {
            type: String,
            default: undefined,
        },
        period: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            totalCount: 0,
            alerts: [],
            moreCount: undefined as undefined | number,
            timezone: computed(() => store.state.user.timezone),
        });

        /* util */
        const dateFormatter = (date) => {
            const current = state.timezone === 'UTC' ? dayjs.utc(date) : dayjs.utc(date).tz(state.timezone);
            if (props.period.includes('d')) {
                return `${current.format('YYYY/MM/DD 00:00:00')} ~ ${current.format('23:59:59')}`;
            }
            return `${current.format('YYYY/MM/DD HH:00:00')} ~ ${current.format('HH:59:59')}`;
        };

        /* api */
        const getQuery = () => {
            const unit = props.period.includes('d') ? 'day' : 'hour';
            const apiQuery = new ApiQueryHelper().setPage(1, 10);
            const filters: ConsoleFilter[] = [];
            const currentTime = state.timezone === 'UTC' ? dayjs.utc(props.date) : dayjs.utc(props.date).tz(state.timezone);
            const start = currentTime.format('YYYY-MM-DD HH:00');
            const end = currentTime.add(1, unit).format('YYYY-MM-DD HH:00');

            filters.push({
                k: 'created_at',
                o: '>=t',
                v: start,
            });
            filters.push({
                k: 'created_at',
                o: '<t',
                v: end,
            });
            apiQuery.setFilters(filters);
            return apiQuery.data;
        };
        const getAlerts = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    project_id: props.projectId,
                    query: {
                        ...getQuery(),
                        only: ['title', 'urgency', 'created_at'],
                    },
                });
                state.totalCount = total_count;
                state.alerts = results;
                if (total_count > 10) state.moreCount = total_count - 10;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.alerts = [];
            } finally {
                state.loading = false;
            }
        };

        onMounted(() => {
            getAlerts();
        });

        return {
            ...toRefs(state),
            red,
            dateFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.top5-project-activity-tooltip {
    @apply rounded-md bg-white border;
    position: absolute;
    display: none;
    top: 1.25rem;
    right: 0;
    line-height: 1.5;
    box-sizing: border-box;
    box-shadow: 0 0 0.5rem rgba(theme('colors.black'), 0.08);
    pointer-events: none;
    z-index: 1;
    padding: 0.5rem;

    &.HIGH {
        @apply border-red-400;
    }
    &.LOW {
        @apply border-red-300;
    }
    &.MAINTENANCE {
        @apply border-yellow-300;
    }

    .tooltip-title-wrapper {
        width: max-content;
        font-size: 0.75rem;

        .title {
            font-size: 0.875rem;
            padding-right: 0.5rem;
        }
        .date {
            @apply text-gray-400;
        }
        .alert-item-wrapper {
            padding: 0.125rem 0;

            .alert-item {
                @apply text-gray-700 truncate;
                display: block;
                max-width: 20rem;
                vertical-align: middle;

                .p-i-icon {
                    margin-right: 0.25rem;
                }
                .title {
                    &.urgency-high {
                        @apply text-red-400;
                    }
                }
            }
        }
    }
}
</style>
