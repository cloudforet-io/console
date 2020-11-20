<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.COLLECTING_PROGRESS')">
        <template #extra>
            <div class="flex justify-end">
                <router-link to="/management/collector-history" class="more">
                    {{ $t('COMMON.WIDGETS.CLOUD_SERVICE_SEE_MORE') }}
                    <p-i name="ic_arrow_right" width="1rem" height="1rem"
                         color="inherit transparent"
                    />
                </router-link>
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
                        {{ $t('COMMON.WIDGETS.COLLECTING_PROGRESS') }}
                    </td>
                </tr>
            </template>
            <template #col-collector_info-format="{index, field, item}">
                <span class="collector-provider"
                      :style="{color: providers[item.collector_info.provider] ? providers[item.collector_info.provider].color : undefined }"
                >{{ providers[item.collector_info.provider].label }}</span>
                <span class="collector-title">{{ item.collector_info.name }}</span>
                <br><span class="time">{{ timeFormatter(item.created_at) }}</span>
            </template>
        </p-data-table>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';
import { TimeStamp } from '@/models';
import { store } from '@/store';


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
        PSkeleton,
        PWidgetLayout,
        PI,
        PDataTable,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
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
                    progress: `${((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100}%`,
                    ...job,
                };
                items.push(newJob);
            });
            return items;
        };
        const timeFormatter = (value) => {
            let time = dayjs(dayjs.unix(value.seconds)).utc();
            if (state.timezone !== 'UTC') {
                time = dayjs(dayjs.unix(value.seconds)).tz(state.timezone);
            }
            return time.format('MM-DD HH:mm ~');
        };

        /* api */
        const getData = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper()
                    .setSort('created_at')
                    .setPage(1, 5)
                    .setFilter({ k: 'status', v: [JOB_STATE.created, JOB_STATE.progress], o: 'in' });
                const res = await SpaceConnector.client.inventory.job.list({ query: query.data });
                state.items = convertJobsToFieldItem(res.results);
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
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
                vm.$router.push('/plugin/collector');
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout::v-deep {
    @apply border border-gray-100;
    border-radius: 0.375rem;
}
.p-data-table::v-deep {
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
    @apply text-sm text-blue-500 font-normal float-right inline-flex items-center cursor-pointer;
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
