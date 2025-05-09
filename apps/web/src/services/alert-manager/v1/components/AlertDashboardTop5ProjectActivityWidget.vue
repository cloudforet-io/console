<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import { find } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PLink, PSelectStatus, PStatus, PSkeleton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import AlertDashboardTop5ProjectActivityWidgetTooltip from '@/services/alert-manager/v1/components/AlertDashboardTop5ProjectActivityWidgetTooltip.vue';
import { ALERT_STATE_FILTER } from '@/services/alert-manager/v1/constants/alert-constant';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';


const ACTIVITY = {
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;
export type AlertActivity = typeof ACTIVITY[keyof typeof ACTIVITY];
const ACTIVITY_COLOR = Object.freeze({
    HIGH: red[400],
    LOW: red[200],
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

const router = useRouter();

const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const allReferenceStore = useAllReferenceStore();
const { getReferenceLocation } = useReferenceRouter();
const state = reactive({
    loading: true,
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    top5Projects: [] as string[],
    activity: {},
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
    alertActivity: computed(() => ({
        HIGH: i18n.t('MONITORING.ALERT.DASHBOARD.HIGH'),
        LOW: i18n.t('MONITORING.ALERT.DASHBOARD.LOW'),
    })),
});

/* util */
const activityFormatter = (results, unit, start, end) => {
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
            workspace_id: storeState.currentWorkspaceId,
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
            workspace_id: storeState.currentWorkspaceId,
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
        name: ALERT_MANAGER_ROUTE_V1.ALERT._NAME,
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
</script>

<template>
    <div class="top-project-activity-widget">
        <div class="title-wrapper">
            <div class="left-part">
                <span class="title">
                    {{ $t('MONITORING.ALERT.DASHBOARD.TOP_5_PROJECT_ACTIVITY') }}
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
                                 v-model="state.selectedPeriod"
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
                    <p-link :to="getReferenceLocation(projectId,{ resource_type: 'identity.Project' })"
                            size="sm"
                            class="col-name"
                    >
                        <span v-tooltip.bottom="projectNameFormatter(projectId, state.projects)"
                              class="tablet:hidden"
                        >{{ projectNameFormatter(projectId, state.projects) }}</span>
                        <span class="tablet-text">{{ projectNameFormatter(projectId, state.projects) }}</span>
                    </p-link>
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
                                <alert-dashboard-top5-project-activity-widget-tooltip
                                    :project-id="projectId"
                                    :status="activity.status"
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
