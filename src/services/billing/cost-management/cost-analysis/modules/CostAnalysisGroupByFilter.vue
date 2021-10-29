<template>
    <div class="cost-analysis-group-by-filter">
        <b class="mr-3">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
        <div class="button-wrapper">
            <p-select-button v-for="groupByItem in groupByItems"
                             :key="groupByItem.name"
                             class="group-by-button"
                             :value="groupByItem"
                             :selected="selectedGroupByItems"
                             multi-selectable
                             size="sm"
                             @change="handleSelectGroupByItems"
            >
                {{ groupByItem.label }}
            </p-select-button>
        </div>
        <component :is="moreGroupBy.length ? 'p-icon-button' : 'p-icon-text-button'"
                   name="ic_setting" style-type="gray900" outline
                   size="sm"
                   @click="handleClickMore"
        >
            <template v-if="!moreGroupBy.length">
                More
            </template>
        </component>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PIconButton, PSelectButton, PIconTextButton,
} from '@spaceone/design-system';

import { GROUP_BY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { store } from '@/store';


export default {
    name: 'CostAnalysisGroupByFilter',
    components: {
        PSelectButton,
        PIconButton,
        PIconTextButton,
    },
    setup() {
        const state = reactive({
            selectedGroupByItems: computed(() => store.state.service.costAnalysis.groupByItems),
            groupByItems: [
                { name: GROUP_BY.PROJECT, label: 'Project' },
                { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
                { name: GROUP_BY.PRODUCT, label: 'Product' },
                { name: GROUP_BY.REGION, label: 'Region' },
                { name: GROUP_BY.PROVIDER, label: 'Provider' },
                { name: GROUP_BY.TYPE, label: 'Type' },
                { name: GROUP_BY.RESOURCE_ID, label: 'Resource ID' },
                { name: GROUP_BY.CURRENCY, label: 'Currency' },
                { name: GROUP_BY.ACCOUNT, label: 'Account' },
            ],
            moreGroupBy: [],
        });

        /* event */
        const handleSelectGroupByItems = async (items: Array<GroupByItem>) => {
            store.commit('service/costAnalysis/setGroupByItems', items);
        };
        const handleClickMore = () => {
            console.log('more!');
        };

        return {
            ...toRefs(state),
            handleSelectGroupByItems,
            handleClickMore,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-group-by-filter {
    @apply bg-white rounded-md border border-gray-200;
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem;
    margin-bottom: 1rem;

    .button-wrapper {
        &::after {
            @apply bg-gray-500;
            display: inline-block;
            position: relative;
            content: '';
            top: 0.25rem;
            width: 1px;
            height: 1rem;
            margin: 0 0.625rem;
        }
        .group-by-button {
            margin-left: 0.375rem;
            &:first-of-type {
                margin-left: 0;
            }
        }
    }
}
</style>
