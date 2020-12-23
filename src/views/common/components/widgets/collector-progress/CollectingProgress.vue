<template>
    <widget-layout>
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.COLLECTING_PROGRESS') }}
                </p>
                <div class="more-btn" @click="goToCollectorHistory">
                    <div class="more">
                        <span class="text-xs">{{ $t('COMMON.WIDGETS.CLOUD_SERVICE_SEE_MORE') }}</span>
                        <p-i name="ic_arrow_right" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </div>
                </div>
            </div>
        </template>
        <p-data-table :items="items" :loading="loading" :fields="fields"
                      :bordered="false"
                      @rowLeftClick="onRowClick"
        >
            <template #skeleton-name>
                <div class="flex items-center">
                    <p-skeleton class="flex-shrink-0 mr-4" width="1.5rem" height="1.5rem" />
                    <p-skeleton />
                </div>
            </template>
            <template #no-data="{fields}">
                <tr key="noData" class="bg-primary3">
                    <td :colspan="fields.length" class="text-gray">
                        {{ $t('COMMON.WIDGETS.COLLECTING_PROGRESS_NO_RUNNING') }}
                    </td>
                </tr>
            </template>
            <template #col-collector_info-format="{index, field, item}">
                <span class="collector-provider"
                      :style="{color: providers[item.collector_info.provider] ? providers[item.collector_info.provider].color : undefined }"
                >{{ providers[item.collector_info.provider] ? providers[item.collector_info.provider].label : item.collector_info.provider }}</span>
                <span class="collector-title">{{ item.collector_info.name }}</span>
                <br><span class="time">{{ timeFormatter(item.created_at) }}</span>
            </template>
            <template #col-progress-format="{item}">
                <p-lottie name="lottie_working" auto
                          :size="1.5"
                />
            </template>
        </p-data-table>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';
import { TimeStamp } from '@/models';
import { QueryHelper } from '@/lib/query';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

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
        PDataTable,
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

        const goToCollectorHistory = async () => {
            await vm.$router.push({
                name: 'collectorHistory',
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
            onRowClick() {
                vm.$router.push({
                    name: 'collectorMain',
                });
            },
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
    }
}
.widget-layout::v-deep {
    @apply border border-gray-100;
    border-radius: 0.375rem;
}
.p-data-table::v-deep {
    border-radius: 0.125rem;
    .default th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
    }
    td {
        height: 3.5rem;
    }
}
.more {
    @apply text-sm text-blue-500 font-normal float-right inline-flex items-center cursor-pointer float-right;
    &:hover {
        @apply text-secondary underline;
    }
}
.collector-provider {
    @apply text-sm;
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
    margin-right: 0.25rem;
}

.collector-title {
    @apply text-sm inline-block truncate;
    max-width: 9rem;
}

.time {
    @apply text-gray-500;
    font-size: 0.75rem;
    line-height: 1.5;
}
</style>
