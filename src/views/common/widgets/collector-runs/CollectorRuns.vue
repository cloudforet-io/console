<template>
    <p-widget-layout title="Run Collectors">
        <template #extra>
            <div class="flex justify-end">
                <p-i name="ic_refresh" class="cursor-pointer" @click="getData" />
            </div>
        </template>
        <p-data-table :items="items" :loading="loading" :fields="fields"
                      :striped="false"
                      bordered
                      table-style-type="primary4"
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
                        {{ $t('DASHBOARD.ACTION.NO_RUN') }}
                    </td>
                </tr>
            </template>
            <template #col-collector_info.name-format="{value}">
                <p-i class="working-icon" name="ic_working"
                     height="1rem" width="1rem"
                />
                <span class="text-sm font-bold ml-2">{{ value }}</span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timeFormatter(value) }}
            </template>
        </p-data-table>
    </p-widget-layout>
</template>

<script lang="ts">
import moment from 'moment';

import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { JOB_STATE, JobModel } from '@/lib/fluent-api/inventory/job';
import { getTimezone } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'CollectorRuns',
    components: {
        PSkeleton,
        PWidgetLayout,
        PI,
        PDataTable,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            items: [] as JobModel[],
            fields: [
                { label: 'Collector', name: 'collector_info.name' },
                { label: 'Completed / Total', name: 'progress' },
                { label: 'Start Time', name: 'created_at' },
            ],
        });

        const convertJobsToFieldItem = (jobs) => {
            const items = [] as JobModel[];
            jobs.forEach((job) => {
                const newJob = {
                    progress: `${job.total_tasks - job.remained_tasks} / ${job.total_tasks}`,
                    ...job,
                };
                items.push(newJob);
            });
            return items;
        };
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

        getData();

        return {
            ...toRefs(state),
            timeFormatter(value) {
                return moment.tz(moment.unix(value.seconds), getTimezone()).format('MM-DD HH:mm ~');
            },
            getData,
            onRowClick() {
                vm.$router.push('/plugin/collector');
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.working-icon {
    animation: spin 2s linear infinite;
}
.p-data-table::v-deep {
    overflow-y: auto;
    td:first-child {
        @apply cursor-pointer;
    }
    th {
        @apply relative border-0;
        .th-contents {
            @apply text-gray-500;
        }
        &:first-child .th-contents {
            padding-left: 0;
        }
    }
}
</style>
