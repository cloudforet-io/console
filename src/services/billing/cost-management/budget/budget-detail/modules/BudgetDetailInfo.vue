<template>
    <section class="budget-detail-summary">
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Total Budgeted Amount
                <span class="font-normal">(Period)</span>
            </span>
            <p class="summary-content">
                <b>$100</b> (Jan 2021 ~ Dec 2021)
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Target
            </span>
            <p class="summary-content">
                <!--                <p-anchor :to="referenceRouter(-->
                <!--                    value,-->
                <!--                    { resource_type: 'identity.Project' })"-->
                <!--                >-->
                <!--                    {{ projects[value] ? projects[value].label : value }}-->
                <!--                </p-anchor>-->
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Cost Type
                <span class="text-gray-900 font-normal">Product</span>
            </span>
            <p class="summary-content cost-type">
                <span class="cost-type-content">Amazon EC2, Amazon test</span>
                <span class="view-all">View all</span>
            </p>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'BudgetDetailSummary',
    components: {
        PPaneLayout,
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
        });
        return {
            ...toRefs(state),
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-detail-summary {
    @apply flex justify-between;
    .summary-card {
        width: 33%;
        min-height: 4.875rem;
        padding: 1rem 1rem;
    }
    .summary-title {
        @apply text-gray-500 font-bold;
        font-size: 0.875rem;
        line-height: 130%;
    }
    .summary-content {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        line-height: 120%;
        &.cost-type {
            @apply flex justify-between;
            .cost-type-content {
                @apply truncate;
                font-size: 0.875rem;
                line-height: 130%;
            }
            .view-all {
                @apply text-blue-600;
                font-size: 0.875rem;
                margin-left: 0.5rem;
                flex-shrink: 0;
            }
        }
    }
}
</style>
