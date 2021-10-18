<template>
    <p-data-table :fields="fields" :items="data"
                  :skeleton-rows="3"
                  :stripe="false"
                  :disable-copy="true"
    />
</template>

<script lang="ts">
import { PDataTable } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PDataTable,
    },
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const getBudgetData = () => {
            const headerData = {
                date: '', limit: 'Budgeted', usd_cost: 'Actual Cost', ratio: 'Current vs. Budgeted',
            };
            const budgetDataWithRatio = props.chartData.map((d) => {
                const ratio = Math.round((d.usd_cost / d.limit) * 100);
                return {
                    ...d, ratio,
                };
            });
            return [headerData, ...budgetDataWithRatio];
        };
        const state = reactive({
            budgetData: computed(() => getBudgetData()),
            fields: computed(() => {
                const res = state.budgetData.map(d => ({
                    name: d.date,
                    label: d.date,
                }));
                return res;
            }),
            data: [],
            loading: true,
        });

        const setItems = (name, path) => {
            const items = { name };
            state.budgetData.forEach((d) => {
                items[d.date] = d[path];
            });
            return items;
        };

        const setTableData = () => {
            // set keys and items
            const keys = [{ name: 'Budgeted', path: 'limit' }, { name: 'Actual Cost', path: 'usd_cost' }, { name: 'Current vs Budget.', path: 'ratio' }];
            keys.forEach((key) => {
                state.data.push(setItems(key.name, key.path));
            });
        };
        setTableData();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
