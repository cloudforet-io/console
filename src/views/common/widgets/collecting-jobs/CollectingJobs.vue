<template>
    <p-widget-layout class="collecting-jobs" title="Collecting Jobs" help="Collecting Jobs">
        <p-data-table :items="data" :loading="loading" :fields="fields"
                      :top-border="false"
                      :striped="false"
                      bordered
                      table-style-type="primary4"
        >
            <template #col-name-format="{value}">
                <p-i class="working-icon" name="ic_working" height="1rem"
                     width="1rem"
                />
                <span class="text-sm font-bold ml-2">{{ value }}</span>
            </template>
            <template #col-start_time-format="{value}">
                {{ timeFormatter(value) }}
            </template>
        </p-data-table>
    </p-widget-layout>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import casual from '@/lib/casual';
import { makeTrItems } from '@/lib/view-helper';
import { getTimezone } from '@/lib/util';
import moment from 'moment';

export default defineComponent({
    name: 'CollectingJobs',
    components: {
        PWidgetLayout,
        PI,
        PDataTable,
    },
    setup() {
        const state: any = reactive({
            data: [],
            loading: true,
            fields: makeTrItems([
                ['name', 'FIELD.COLLECTOR'],
                ['start_time', 'FIELD.START_TIME'],
            ]),
        });

        const api = async () => new Promise((resolve) => {
            setTimeout(() => { // inventory/job/list { state = CREATED | IN_PROGRESS}
                resolve([{
                    collector_id: casual._uuid(),
                    name: 'Collector Name',
                    start_time: {
                        seconds: `${casual.unix_time}`,
                    },
                }, {
                    collector_id: casual._uuid(),
                    name: 'Collector Name',
                    start_time: {
                        seconds: `${casual.unix_time}`,
                    },
                }, {
                    collector_id: casual._uuid(),
                    name: 'Collector Name',
                    start_time: {
                        seconds: `${casual.unix_time}`,
                    },
                }, {
                    collector_id: casual._uuid(),
                    name: 'Collector Name',
                    start_time: {
                        seconds: `${casual.unix_time}`,
                    },
                }]);
            }, 1000);
        });

        const getData = async () => {
            state.loading = true;
            state.data = await api();
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
            timeFormatter(value) {
                return moment.tz(moment.unix(value.seconds), getTimezone()).format('MM/DD HH:mm ~');
            },
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
