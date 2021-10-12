<template>
    <p-definition-table :fields="fields" :data="data"
                        :skeleton-rows="3"
                        :stripe="false"
                        :disable-copy="true"
    />
</template>

<script lang="ts">
import { PDefinitionTable } from '@spaceone/design-system';
import { map } from 'lodash';
import { computed, reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PDefinitionTable,
    },
    setup() {
        const state = reactive({
            fields: computed(() => map(state.data, (d, k) => ({ name: k, label: k.replace(/\_/g, ' ') }))),
            data: {},
            loading: true,
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
