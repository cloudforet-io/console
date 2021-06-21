<template>
    <div class="top-project-activity-widget">
        <div class="title-wrapper">
            <div class="left-part">
                <span class="title">
                    {{ $t('MONITORING.ALERT.DASHBOARD.TOP_5_PROJECT_ACTIVITY') }}
                </span>
                <div class="legend-wrapper">
                    <p-status v-for="(activity, idx) in Object.keys(ACTIVITY)" :key="`status-${idx}`"
                              :icon-color="ACTIVITY_COLOR[activity]"
                              :text="capitalize(activity)"
                    />
                </div>
            </div>
            <div class="period-wrapper">
                <p-select-status v-for="(period, idx) in periods" :key="`period-${idx}`"
                                 v-model="selectedPeriod"
                                 :value="period.name"
                                 :disable-check-icon="true"
                >
                    {{ period.label }}
                </p-select-status>
            </div>
        </div>
        <div class="content-wrapper">
            <div v-for="(item, idx) in items" :key="`table-row-${idx}`"
                 class="table-row"
            >
                <p-anchor :to="referenceRouter(item.projectId,{ resource_type: 'identity.Project' })"
                          :show-icon="false"
                          class="col-name"
                >
                    <span class="tablet:hidden">{{ projects[item.projectId] ? projects[item.projectId].label : item.projectId }}</span>
                    <span class="tablet-text">{{ projects[item.projectId] ? projects[item.projectId].name : item.projectId }}</span>
                </p-anchor>
                <div class="col-activity">
                    <div v-for="(activity, aIdx) in item.activities" :key="`activity-${aIdx}`"
                         class="box-wrapper"
                    >
                        <div class="box" :class="activity ? activity : 'empty'">
                            <div class="tooltip">
                                <div class="tooltip-title-wrapper">
                                    <span class="title">Alert <strong>(2)</strong></span>
                                    <span class="date">2021/05/20 6:00:00 ~ 6:59:59</span>
                                    <div class="alert-item-wrapper">
                                        <p class="alert-item">
                                            <p-i name="ic_alert" width="0.75rem" height="0.75rem" />
                                            <span>Vulnerability - ViewState is not Encrypted</span>
                                        </p>
                                        <p class="alert-item">
                                            <p-i name="ic_alert" width="0.75rem" height="0.75rem" />
                                            <span>Vulnerability - ViewState is not Encrypted</span>
                                        </p>
                                    </div>
                                    <p>8 more alert(s) was created</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { capitalize, range, sample } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PAnchor, PI, PSelectStatus, PStatus,
} from '@spaceone/design-system';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { red, yellow } from '@/styles/colors';


const ACTIVITY = Object.freeze({
    HIGH: 'HIGH',
    LOW: 'LOW',
    MAINTENANCE: 'MAINTENANCE',
});
const ACTIVITY_COLOR = Object.freeze({
    HIGH: red[400],
    LOW: red[200],
    MAINTENANCE: yellow[400],
});
const PERIOD = Object.freeze({
    '7D': 7,
    '24H': 24,
    '12H': 12,
});

export default {
    name: 'Top5ProjectActivityWidget',
    components: {
        PAnchor,
        PI,
        PStatus,
        PSelectStatus,
    },
    setup(props, { refs }) {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            items: [
                {
                    projectId: 'project-18655561c535',
                    activities: [],
                },
                {
                    projectId: 'project-2db511294a9d',
                    activities: [],
                },
                {
                    projectId: 'project-113c197ce1f2',
                    activities: [],
                },
                {
                    projectId: 'project-9074eea97d7e',
                    activities: [],
                },
                {
                    projectId: 'project-022311e93b63',
                    activities: [],
                },
            ],
            periods: [
                {
                    name: PERIOD['24H'],
                    label: '24h',
                },
                {
                    name: PERIOD['12H'],
                    label: '12h',
                },
                {
                    name: PERIOD['7D'],
                    label: '7d',
                },
            ],
            selectedPeriod: PERIOD['7D'],
        });

        /* event */
        const getActivities = () => {
            const activities = [undefined, ACTIVITY.HIGH, ACTIVITY.MAINTENANCE, ACTIVITY.LOW];

            state.items.forEach((item) => {
                item.activities = range(0, state.selectedPeriod).map(() => sample(activities)) as any;
            });
        };

        watch(() => state.selectedPeriod, () => {
            getActivities();
        }, { immediate: true });

        return {
            ...toRefs(state),
            ACTIVITY,
            ACTIVITY_COLOR,
            referenceRouter,
            capitalize,
        };
    },
};
</script>

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
            font-size: 0.875rem;
        }
    }
    .content-wrapper {
        @apply grid;
        display: grid;
        gap: 0.125rem;

        .table-row {
            @apply grid grid-cols-12;
            gap: 0.5rem;

            .col-name {
                @apply col-span-3 truncate;
                text-align: right;
                font-size: 0.75rem;

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
                            .tooltip {
                                @apply border-red-400;
                            }
                        }
                        &.LOW {
                            @apply bg-red-200;
                            &:hover {
                                @apply border-red-700;
                                border-width: 0.25rem;
                            }
                            .tooltip {
                                @apply border-red-300;
                            }
                        }
                        &.MAINTENANCE {
                            @apply bg-yellow-300;
                            &:hover {
                                @apply border-yellow-700;
                                border-width: 0.25rem;
                            }
                            .tooltip {
                                @apply border-yellow-300;
                            }
                        }
                        &:hover:not(.empty) {
                            .tooltip {
                                display: block;
                            }
                        }

                        .tooltip {
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
                                    }
                                }
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

            .period-wrapper {
                flex-direction: row-reverse;
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
