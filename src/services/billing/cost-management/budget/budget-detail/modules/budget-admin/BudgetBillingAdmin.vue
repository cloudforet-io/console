<template>
    <p-card
        class="budget-billing-admin-wrapper"
        style-type="gray100"
        size="lg"
    >
        <template #header>
            Billing Admin
        </template>
        <p-data-table
            :loading="loading && budgetLoading"
            :fields="fields" :items="data"
            :skeleton-rows="3"
            :stripe="false"
            :disable-copy="true"
        />
    </p-card>
</template>

<script lang="ts">
import { PDataTable, PCard } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { store } from '@/store';

export default {
    name: 'BudgetDetailBillingAdmin',
    components: {
        PCard,
        PDataTable,
    },
    setup() {
        const state = reactive({
            loading: true,
            budgetLoading: computed(() => store.getters['service/budget/isBudgetLoading']),
            fields: [
                { name: 'resource_id', label: 'User ID' },
                { name: 'resource_id', label: 'User Name' },
                { name: 'role_info.', label: 'Role' },
                { name: 'project_id', label: 'Assigned' },
                { name: 'labels', label: 'Label' },
            ] as unknown as DataTableField,
            data: [],
            budgetTargetProjectId: computed(() => store.state.service.budget.budgetData?.project_id) || undefined,
            budgetTargetProjectGroupId: computed(() => store.state.service.budget.budgetData?.project_group_id) || undefined,
        });

        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([{ k: 'role.name', v: 'Billing Admin', o: '=' }]);

        const listBillingAdmin = async () => {
            state.loading = true;
            try {
                if (!state.budgetTargetProjectGroupId && !state.budgetTargetProjectId) return;
                if (state.budgetTargetProjectId) {
                    const { results } = await SpaceConnector.client.identity.project.member.list({
                        include_parent_member: true,
                        project_id: state.budgetTargetProjectId,
                        query: apiQueryHelper.data,
                    });
                    state.data = results;
                } else if (state.budgetTargetProjectGroupId) {
                    const { results } = await SpaceConnector.client.identity.projectGroup.member.list({
                        include_parent_member: true,
                        project_group_id: state.budgetTargetProjectGroupId,
                        query: apiQueryHelper.data,
                    });
                    state.data = results;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        if (!state.budgetLoading) listBillingAdmin();


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
