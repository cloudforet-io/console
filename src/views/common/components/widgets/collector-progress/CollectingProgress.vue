<template>
    <widget-layout>
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.COLLECTING_PROGRESS') }}
                </p>
                <router-link
                    :to="{ name: 'collectorHistory' }"
                    class="more-btn"
                >
                    <div class="more">
                        <span class="text-xs">{{ $t('COMMON.WIDGETS.CLOUD_SERVICE_SEE_MORE') }}</span>
                        <p-i name="ic_arrow_right" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </div>
                </router-link>
            </div>
        </template>
        <template v-if="loading">
            <div v-for="skeleton in skeletons" :key="skeleton" class="grid grid-cols-1 gap-1 my-4 w-full">
                <p-skeleton width="80%" height="0.625rem" />
                <p-skeleton width="100%" height="0.625rem" />
            </div>
        </template>
        <div v-else-if="!loading && items.length > 0">
            <div v-for="(item, index) in items" :key="index"
                 class="card grid grid-cols-12 cursor-pointer"
                 @click="goToCollectorHistory(item)"
            >
                <div class="left-part col-span-10">
                    <span class="collector-provider"
                          :style="{color: providers[item.collector_info.provider] ? providers[item.collector_info.provider].color : undefined }"
                    >{{ providers[item.collector_info.provider] ? providers[item.collector_info.provider].label : item.collector_info.provider }}</span>
                    <span class="collector-title">{{ item.collector_info.name }}</span>
                    <br><span class="time">{{ timeFormatter(item.created_at) }}</span>
                </div>
                <div class="right-part col-span-2">
                    <p-lottie name="lottie_working" auto
                              :size="1.5"
                    />
                </div>
            </div>
        </div>
        <div v-else class="no-data-wrapper">
            <img src="@/assets/images/illust_star.svg" class="no-data-img">
            <p class="no-data-text">
                {{ $t('COMMON.WIDGETS.COLLECTING_PROGRESS_NO_RUNNING') }}
            </p>
        </div>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { range } from 'lodash';
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PLottie, PSkeleton, PI } from '@spaceone/design-system';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';
import { TimeStamp } from '@/models';

enum JOB_STATE {
    created = 'CREATED',
    progress = 'IN_PROGRESS',
    failure = 'FAILURE',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
    success = 'SUCCESS'
}

export interface JobModel {
        job_id: string;
        state: JOB_STATE;
        collect_mode: COLLECT_MODE;
        collector_info: CollectorModel;
        secret_id: string;
        filter: any;
        errors: {
            code: string;
            message: string;
            secret_id?: string;
        }[];
        created_at: TimeStamp;
        finished_at: TimeStamp;
    }

export default {
    name: 'CollectorRuns',
    components: {
        PLottie,
        WidgetLayout,
        PSkeleton,
        PI,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        timezone: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            skeletons: range(2),
            items: [] as JobModel[],
            fields: computed(() => [
                { label: vm.$t('COMMON.WIDGETS.COLLECTING_PROGRESS_TITLE_TIME'), name: 'collector_info' },
                { label: vm.$t('COMMON.WIDGETS.COLLECTING_PROGRESS_STATUS'), name: 'progress' },
            ]),
        });

        /* util */
        const convertJobsToFieldItem = (jobs) => {
            const items = [] as JobModel[];
            jobs.forEach((job) => {
                const newJob = {
                    progress: `${(Math.round((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100)}%`,
                    ...job,
                };
                items.push(newJob);
            });
            return items;
        };
        const timeFormatter = (value) => {
            let time = dayjs(dayjs.unix(value.seconds)).utc();
            if (props.timezone !== 'UTC') {
                time = dayjs(dayjs.unix(value.seconds)).tz(props.timezone);
            }
            return time.format('MM-DD HH:mm ~');
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getData = async () => {
            state.loading = true;
            try {
                apiQuery.setSort('created_at')
                    .setPage(1, 5)
                    .setFilters([{ k: 'status', v: [JOB_STATE.created, JOB_STATE.progress], o: '=' }]);
                const res = await SpaceConnector.client.inventory.job.list({ query: apiQuery.data });
                state.items = convertJobsToFieldItem(res.results);
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const goToCollectorHistory = async (item) => {
            await vm.$router.push({
                name: 'collectorHistory',
                hash: item.job_id,
            });
        };

        const init = async () => {
            await getData();
        };
        init();

        return {
            ...toRefs(state),
            timeFormatter,
            getData,
            goToCollectorHistory,
        };
    },
};
</script>

<style lang="postcss" scoped>
.top {
    @apply flex justify-between pb-4;
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .more-btn {
        @apply flex-shrink-0 flex justify-end;
        font-size: 0.75rem;
        .more {
            @apply text-sm text-blue-500 font-normal float-right inline-flex items-center cursor-pointer float-right;
            &:hover {
                @apply text-secondary underline;
            }
        }
    }
}
.widget-layout::v-deep {
    @apply border border-gray-100;
    position: relative;
    min-height: 18.75rem;
    border-radius: 0.375rem;
}

.no-data-wrapper {
    position: absolute;
    width: 100%;
    left: 0;
    top: 6rem;
    .no-data-img {
        @apply mx-auto mb-4 flex-shrink-0;
        width: 3.75rem;
        opacity: 0.7;
    }
    .no-data-text {
        @apply text-center text-primary2;
        font-weight: bold;
        font-size: 0.875rem;
        line-height: 150%;
    }
}
.card {
    border-radius: 0.25rem;
    padding: 0.75rem 1rem;
    &:nth-child(odd) {
        @apply bg-primary4;
    }
    .left-part {
        .collector-provider {
            font-size: 0.875rem;
            line-height: 1.4;
            margin-right: 0.25rem;
        }
        .collector-title {
            @apply truncate;
            display: inline-block;
            max-width: 9rem;
            line-height: 1.4;
            vertical-align: top;
            font-size: 0.875rem;
            @media screen and (width < 576px) {
                max-width: initial;
            }
        }
        .time {
            @apply text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
    .right-part {
        margin: auto;
    }
}
</style>
