<template>
    <p-toolbox-table :fields="fields"
                     :exportable="true"
    />
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { PToolboxTable } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';


export default {
    name: 'CostAnalysisDataTable',
    components: {
        PToolboxTable,
    },
    props: {},
    setup() {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            currency: computed(() => store.state.service.costAnalysis.currency),
            selectedDates: computed(() => store.state.service.costAnalysis.selectedDates),
            groupByItems: computed(() => store.state.service.costAnalysis.groupByItems),
            // todo: 표에 영향을 주는 데이터: granularity, group by, period, filter, currency
            fields: computed(() => ([
                { name: 'project_group', label: 'Project Group' },
                { name: '2021-08-01', label: '8/1' },
            ])),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
</style>
