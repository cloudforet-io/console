<template>
    <p-widget-layout class="collecting-jobs" title="Collecting Jobs" help="Collecting Jobs">
        <template #extra>
            <div class="flex justify-end">
                <p-i name="ic_refresh" class="cursor-pointer" @click="getData" />
            </div>
        </template>
        <p-data-table :items="items" :loading="loading" :fields="fields"
                      :responsive-style="responsiveStyle"
                      :top-border="false"
                      :striped="false"
                      bordered
                      table-style-type="primary4"
        >
            <template #skeleton-name>
                <div class="flex items-center">
                    <p-skeleton class="flex-shrink-0 mr-4" width="1.5rem" height="1.5rem" />
                    <p-skeleton />
                </div>
            </template>
            <template #no-data="{fields}">
                <p-tr key="noData" class="no-data-row bg-primary3">
                    <p-td class="no-data" :colspan="fields.length" />
                </p-tr>
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
    defineComponent, reactive, toRefs, computed,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import casual, { arrayOf } from '@/lib/casual';
import { makeTrItems } from '@/lib/view-helper';
import { getTimezone } from '@/lib/util';
import moment from 'moment';
import { fluentApi, TimeStamp } from '@/lib/fluent-api';
import { OPERATORS } from '@/lib/fluent-api/statistics/toolset';
import { DataTableToolSet } from '@/components/organisms/tables/data-table/toolset';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';

export default defineComponent({
    name: 'CollectingJobs',
    components: {
        PTd,
        PTr,
        PSkeleton,
        PWidgetLayout,
        PI,
        PDataTable,
    },
    setup() {
        const ts = new DataTableToolSet({
            fields: computed(() => makeTrItems([
                ['name', 'FIELD.COLLECTOR'],
                ['start', 'FIELD.START_TIME'],
            ])),
            responsiveStyle: {
                height: '100%',
            },
            tableStyle: {
                height: '100%',
            },
        }, {
            loading: true,
        });

        interface Data {
            name: string;
            start: TimeStamp;
        }

        const api = fluentApi.statisticsTest().history().query<Data>()
            .addField('collector_id', OPERATORS.value, 'name')
            .addField('created_at', OPERATORS.value, 'start')
            .setLimit(7)
            .setSort('created_at')
            .setFilterOr(
                { key: 'state', operator: '=', value: 'CREATED' },
                { key: 'state', operator: '=', value: 'IN_PROGRESS' },
            );

        const getData = async () => {
            ts.syncState.loading = true;
            ts.state.items = [];
            try {
                const res = await api.execute();
            } catch (e) {
                ts.state.items = arrayOf(casual.integer(0, 5), () => ({
                    name: casual.word,
                    start: {
                        seconds: `${casual.unix_time}`,
                    },
                }));
            } finally {
                ts.syncState.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(ts.state),
            ...toRefs(ts.syncState),
            timeFormatter(value) {
                return moment.tz(moment.unix(value.seconds), getTimezone()).format('MM/DD HH:mm ~');
            },
            getData,
        };
    },
});
</script>

<style lang="postcss" scoped>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.working-icon {
    animation: spin 2s linear infinite;
}
</style>
