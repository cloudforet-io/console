<script lang="ts" setup>

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PAnchor, PSelectStatus, PStatus, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { find } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, yellow } from '@/styles/colors';

import Top5ProjectActivityTooltip from '@/services/alert-manager/alert-dashboard/modules/top-5-project-activity-widget/Top5ProjectActivityTooltip.vue';
import { ALERT_STATE_FILTER } from '@/services/alert-manager/lib/config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';

// const ACTIVITY = {
//     HIGH: 'HIGH',
//     LOW: 'LOW',
//     // MAINTENANCE: 'MAINTENANCE',
// } as const;
// export type AlertActivity = typeof ACTIVITY[keyof typeof ACTIVITY];
const ACTIVITY_COLOR = Object.freeze({
    HIGH: red[400],
    LOW: red[200],
    MAINTENANCE: yellow[400],
});
const PERIOD = Object.freeze({
    '14D': '14d',
    '7D': '7d',
    '24H': '24h',
    '12H': '12h',
});
const DATE_TYPE = Object.freeze({
    DAILY: 'DAILY',
    HOURLY: 'HOURLY',
});

interface Activity {
    date: string;
    status?: string;
}

interface Props {
    projectsWithAlert?: string[];
}

withDefaults(defineProps<Props>(), {
    projectsWithAlert: () => ([]),
});

const store = useStore();
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    loading: true,
    projects: computed(() => store.getters['reference/projectItems']),
    top5Projects: [] as string[],
    activity: {} as Record<string, Activity[]>,
    periods: [
        {
            name: PERIOD['14D'],
            label: '14d',
        },
        {
            name: PERIOD['7D'],
            label: '7d',
        },
        {
            name: PERIOD['24H'],
            label: '24h',
        },
        {
            name: PERIOD['12H'],
            label: '12h',
        },
    ],
    selectedPeriod: PERIOD['14D'],
    showTooltip: false,
    alertActivity: computed(() => ({
        HIGH: t('MONITORING.ALERT.DASHBOARD.HIGH'),
        LOW: t('MONITORING.ALERT.DASHBOARD.LOW'),
    })),
});

/* util */
const activityFormatter = (results, unit, start, end): Activity[] => {
    const dateFormat = unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH';
    let now = start.clone();
    const activities: Activity[] = [];

    while (now.isBefore(end, unit)) {
        const isHigh = find(results, { urgency: 'HIGH', date: now.format(dateFormat) });
        const isLow = find(results, { urgency: 'LOW', date: now.format(dateFormat) });
        let status;
        if (isLow) status = 'LOW';
        if (isHigh) status = 'HIGH';
        activities.push({
            date: now.format(dateFormat),
            status,
        });
        now = now.add(1, unit);
    }
    return activities;
};
const periodNumberFormatter = (period) => parseInt(period.match(/\d+/)[0]);
const projectNameFormatter = (projectId: string, projects: ProjectReferenceMap) => projects[projectId]?.label || projectId;

/* api */
const getTop5ProjectList = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.top5ProjectActivityList({
            period: state.selectedPeriod,
        });
        state.top5Projects = results.map((d) => d.project_id);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.top5Projects = [];
    }
};
const getActivities = async (projectId) => {
    try {
        const unit = state.selectedPeriod.includes('d') ? 'day' : 'hour';
        const end = dayjs.utc().add(1, unit).startOf(unit);
        const start = end.subtract(periodNumberFormatter(state.selectedPeriod), unit);

        const { results } = await SpaceConnector.client.monitoring.dashboard.top5ProjectActivityAlertDetails({
            project_id: projectId,
            granularity: state.selectedPeriod.includes('d') ? DATE_TYPE.DAILY : DATE_TYPE.HOURLY,
            start: start.toISOString(),
            end: end.toISOString(),
        });
        state.activity[projectId] = activityFormatter(results, unit, start, end);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.activity[projectId] = [];
    }
};

/* event */
const urlQueryHelper = new QueryHelper();
const onClickBox = (projectId, date) => {
    urlQueryHelper.setFilters([
        { k: 'project_id', v: projectId, o: '=' },
        { k: 'created_at', v: date.split(' ')[0], o: '=t' },
    ]);
    router.replace({
        name: ALERT_MANAGER_ROUTE.ALERT._NAME,
        query: {
            filters: urlQueryHelper.rawQueryStrings,
            state: ALERT_STATE_FILTER.ALL,
        },
    });
};

watch(() => state.selectedPeriod, async () => {
    state.loading = true;
    await getTop5ProjectList();
    await Promise.all(state.top5Projects.map((d) => getActivities(d)));
    state.loading = false;
}, { immediate: true });

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/project/load');
})();

</script>

<template>
    <div class="top-project-activity-widget">
        <div class="title-wrapper">
            <div class="left-part">
                <span class="title">
                    {{ t('MONITORING.ALERT.DASHBOARD.TOP_5_PROJECT_ACTIVITY') }}
                </span>
                <div class="legend-wrapper">
                    <p-status v-for="(activityLabel, activity, idx) in state.alertActivity"
                              :key="`status-${idx}`"
                              :icon-color="ACTIVITY_COLOR[activity]"
                              :text="activityLabel"
                    />
                </div>
            </div>
            <div class="period-wrapper">
                <p-select-status v-for="(period, idx) in state.periods"
                                 :key="`period-${idx}`"
                                 v-model:selected="state.selectedPeriod"
                                 :value="period.name"
                                 :disable-check-icon="true"
                >
                    {{ period.label }}
                </p-select-status>
            </div>
        </div>
        <div class="content-wrapper">
            <p-skeleton v-if="state.loading"
                        width="100%"
                        height="100%"
            />
            <template v-else>
                <div v-for="(projectId, idx) in state.top5Projects"
                     :key="`table-row-${idx}`"
                     class="table-row"
                >
                    <p-anchor :to="referenceRouter(projectId,{ resource_type: 'identity.Project' })"
                              hide-icon
                              size="sm"
                              class="col-name"
                    >
                        <span v-tooltip.bottom="projectNameFormatter(projectId, state.projects)"
                              class="tablet:hidden"
                        >{{ projectNameFormatter(projectId, state.projects) }}</span>
                        <span class="tablet-text">{{ projectNameFormatter(projectId, state.projects) }}</span>
                    </p-anchor>
                    <div class="col-activity">
                        <div v-for="(activity, aIdx) in state.activity[projectId]"
                             :key="`activity-${aIdx}`"
                             class="box-wrapper"
                             :class="activity.status ? activity.status : 'empty'"
                        >
                            <div class="box"
                                 :class="activity.status ? activity.status : 'empty'"
                                 @click="onClickBox(projectId, activity.date)"
                            >
                                <top5-project-activity-tooltip
                                    :project-id="projectId"
                                    :status="activity.status || ''"
                                    :date="activity.date"
                                    :period="state.selectedPeriod"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-project-activity-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title-wrapper {
        display: flex;
        margin-bottom: 1rem;
        justify-content: space-between;

        .title {
            @apply text-gray-900;
            font-size: 1rem;
            line-height: 1.6;
            font-weight: bold;
        }

        .legend-wrapper {
            display: inline-flex;
            font-size: 0.75rem;
            gap: 0.75rem;
            padding-left: 1rem;
        }

        .period-wrapper {
            @apply text-gray-700;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            font-size: 0.875rem;
        }
    }
    .content-wrapper {
        @apply grid;
        display: grid;
        gap: 0.125rem;
        max-height: 6.75rem;

        .table-row {
            @apply grid grid-cols-12;
            gap: 0.5rem;

            .col-name {
                @apply col-span-3 truncate justify-end;
                text-align: right;

                .tablet-text {
                    display: none;
                }
            }
            .col-activity {
                @apply col-span-9;
                display: flex;
                gap: 0.125rem;

                .box-wrapper {
                    @apply bg-gray-200;
                    position: relative;
                    width: 100%;
                    height: 1.25rem;

                    &:hover:not(.empty) {
                        cursor: pointer;
                    }

                    .box {
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;

                        &.HIGH {
                            @apply bg-red-400;
                            &:hover {
                                @apply border-red-700;
                                border-width: 0.25rem;
                            }
                        }
                        &.LOW {
                            @apply bg-red-200;
                            &:hover {
                                @apply border-red-400;
                                border-width: 0.25rem;
                            }
                        }
                        &.MAINTENANCE {
                            @apply bg-yellow-300;
                            &:hover {
                                @apply border-yellow-600;
                                border-width: 0.25rem;
                            }
                        }
                        &:hover:not(.empty) {
                            .top5-project-activity-tooltip {
                                display: block;
                            }
                        }
                    }
                }
            }
        }
    }

    @screen tablet {
        .title-wrapper {
            display: block;

            .title {
                display: block;
                margin-bottom: 1rem;
            }

            .legend-wrapper {
                display: flex;
                padding-left: 0;
                padding-bottom: 1rem;
            }
        }

        .content-wrapper {
            .table-row {
                .col-name {
                    .tablet-text {
                        display: contents;
                    }
                }
            }
        }
    }
}
</style>
