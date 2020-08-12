<template>
    <p-widget-layout title="Recent Collecting Runs" :help="$t('DASHBOARD.ACTION.RECENT_COLLECTING')">
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
            <template #col-name-format="{value}">
                <p-i class="working-icon" name="ic_working" height="1rem"
                     width="1rem"
                />
                <span class="text-sm font-bold ml-2">{{ value }}</span>
            </template>
            <template #col-start-format="{value}">
                {{ timeFormatter(value) }}
            </template>
        </p-data-table>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import { getTimezone } from '@/lib/util';
import moment from 'moment';
import { FILTER_OPERATOR, fluentApi, TimeStamp } from '@/lib/fluent-api';
import { DataTableToolSet } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { JOB_STATE } from '@/lib/fluent-api/inventory/job';

export default {
    name: 'SCollectingRuns',
    components: {
        PSkeleton,
        PWidgetLayout,
        PI,
        PDataTable,
    },
    setup() {
        const vm: any = getCurrentInstance();
        const ts = new DataTableToolSet({
            fields: computed(() => makeTrItems([
                ['name', 'FIELD.COLLECTOR'],
                ['start', 'FIELD.START_TIME'],
            ])),
        }, {
            loading: true,
        });

        interface Data {
            name: string;
            start: TimeStamp;
        }


        const api = fluentApi.inventory().jobs().list()
            .setOnly('job_id', 'collector', 'created_at')
            .setFilter({ key: 'state', value: [JOB_STATE.created, JOB_STATE.progress], operator: FILTER_OPERATOR.contain })
            .setSortBy('created_at')
            .setPageSize(5)
            .setThisPage(1);

        const getData = async () => {
            ts.syncState.loading = true;
            try {
                const res = await api.execute();
                ts.state.items = res.data.results.map(d => ({
                    name: d.collector_info.name,
                    start: d.created_at,
                }));
            } catch (e) {
                ts.state.items = [];
                console.error(e);
            } finally {
                ts.syncState.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(ts.state),
            ...toRefs(ts.syncState),
            timeFormatter(value) {
                return moment.tz(moment.unix(value.seconds), getTimezone()).format('MM/DD HH:mm ~');
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
            @apply text-gray;
        }
    }
}

</style>
