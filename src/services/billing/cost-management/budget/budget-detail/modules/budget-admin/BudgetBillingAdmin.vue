<template>
    <p-card
        class="budget-billing-admin-wrapper"
        style-type="gray100"
        size="lg"
    >
        <template #header>
            Billing Admin
        </template>
        <p-data-table :fields="fields" :items="data"
                      :skeleton-rows="3"
                      :stripe="false"
                      :disable-copy="true"
        />
    </p-card>
</template>

<script lang="ts">
import { PDataTable, PCard } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PCard,
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
.budget-billing-admin-wrapper::v-deep .body {
    padding: 1.5rem 0 0 0;
}
</style>
