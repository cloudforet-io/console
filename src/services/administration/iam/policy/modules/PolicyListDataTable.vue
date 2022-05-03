<template>
    <section class="policy-list-data-table">
        <p-toolbox-table
            exportable
            :fields="fields"
            :items="items"
        >
            <template slot="toolbox-top">
                <div class="filter">
                    <!--                    song-lang-->
                    <span class="filter-label">Type</span>
                    <p-select-status>Managed</p-select-status>
                    <p-select-status>Custom</p-select-status>
                </div>
            </template>
        </p-toolbox-table>
    </section>
</template>

<script lang="ts">
import {
    PToolboxTable, PSelectStatus,
} from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { reactive, toRefs } from '@vue/composition-api';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'PolicyListDataTable',
    components: {
        PToolboxTable,
        PSelectStatus,
    },
    setup() {
        const state = reactive({
            loading: false,
            policyList: [],
            fields: [
                { name: 'k1', label: 'Name', type: 'item' },
                { name: 'k2', label: 'Type', type: 'item' },
                { name: 'k3', label: 'ID', type: 'item' },
                { name: 'k4', label: 'Description', type: 'item' },
                { name: 'k5', label: 'Created At', type: 'item' },
            ],
            items: [
                {
                    k1: 'v1', k2: 'v2', k3: 'v3', k4: 'v4', k5: 'k5',
                },
            ],
        });

        const listPolicies = async () => {
            state.loading = true;

            try {
                const res = await SpaceConnector.client.identity.policy.list();
                state.policyList = res.results;
                console.log(state.policyList);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.policyList = [];
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await listPolicies();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.filter {
    margin: 1.625rem 1rem -0.375rem;
    .filter-label {
        @apply text-gray-400;
        margin-right: 1rem;
        font-size: 0.875rem;
        line-height: 1.15;
    }
    .p-status {
        margin-right: 1rem;
    }
}
</style>
