<template>
    <p-pane-layout class="budget-billing-admin-wrapper">
        <div class="card-header">
            Billing Admin
        </div>
        <p-data-table :fields="fields" :items="data"
                      :skeleton-rows="3"
                      :stripe="false"
                      :disable-copy="true"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import { PDataTable, PPaneLayout } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PPaneLayout,
        PDataTable,
    },
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
    },
    setup() {
        const state = reactive({
            loading: true,
            fields: [
                { name: 'resource_id', label: 'User ID' },
                { name: 'resource_id', label: 'User Name' },
                { name: 'role_info.', label: 'Role' },
                { name: 'project_id', label: 'Assigned' },
                { name: 'labels', label: 'Label' },
            ] as unknown as DataTableField,
            data: [],
        });

        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([{ k: 'role.name', v: 'Billing Admin', o: '=' }]);
        const listBillingAdmin = async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.identity.project.member.list({
                    include_parent_member: true,
                    project_id: 'project-18655561c535',
                    query: apiQueryHelper.data,
                });
                state.data = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        (async () => {
            await listBillingAdmin();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-billing-admin-wrapper {
    @apply flex flex-col;
    min-width: 100%;
    min-height: 100%;
}
.card-header {
    @apply bg-gray-100 items-center;
    display: inherit;
    padding: 1rem;
    margin-bottom: 1.5rem;
    min-height: 4rem;
    font-size: 1.5rem;
    line-height: 135%;
}
</style>
