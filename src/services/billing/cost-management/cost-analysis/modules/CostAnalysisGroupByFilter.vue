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
                             :predicate="predicate"
                             @change="handleSelectGroupByItems"
            >
                {{ groupByItem.label }}
            </p-select-button>
        </div>
        <!--        <component :is="moreGroupBy.length ? 'p-icon-button' : 'p-icon-text-button'"-->
        <!--                   name="ic_setting" style-type="gray900" outline-->
        <!--                   size="sm"-->
        <!--                   @click="handleClickMore"-->
        <!--        >-->
        <!--            <template v-if="!moreGroupBy.length">-->
        <!--                More-->
        <!--            </template>-->
        <!--        </component>-->
        <!--        <cost-analysis-set-more-modal :header-title="setMoreModalState.headerTitle"-->
        <!--                                      :visible.sync="setMoreModalState.visible"-->
        <!--                                      @confirm="handleSetMoreModalConfirm"-->
        <!--        />-->
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PSelectButton,
} from '@spaceone/design-system';

// import CostAnalysisSetMoreModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSetMoreModal.vue';

import { GROUP_BY_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { store } from '@/store';
import { i18n } from '@/translations';


export default {
    name: 'CostAnalysisGroupByFilter',
    components: {
        PSelectButton,
        // PIconButton,
        // PIconTextButton,
        // CostAnalysisSetMoreModal,
    },
    setup() {
        const state = reactive({
            selectedGroupByItems: computed<GroupByItem[]>(() => store.state.service.costAnalysis.groupByItems),
            groupByItems: [
                { name: GROUP_BY_ITEM.PROJECT, label: 'Project' },
                { name: GROUP_BY_ITEM.SERVICE_ACCOUNT, label: 'Service Account' },
                { name: GROUP_BY_ITEM.PRODUCT, label: 'Product' },
                { name: GROUP_BY_ITEM.REGION, label: 'Region' },
                { name: GROUP_BY_ITEM.PROVIDER, label: 'Provider' },
                { name: GROUP_BY_ITEM.TYPE, label: 'Type' },
                { name: GROUP_BY_ITEM.RESOURCE, label: 'Resource' },
                { name: GROUP_BY_ITEM.ACCOUNT, label: 'Account' },
            ],
            moreGroupBy: [],
        });

        const setMoreModalState = reactive({
            visible: false,
            headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_MORE')),
        });

        /* util */
        const predicate = (current, data) => Object.keys(current).every(key => current[key] === data[key]);

        /* event */
        const handleSelectGroupByItems = async (items: GroupByItem[]) => {
            store.commit('service/costAnalysis/setGroupByItems', items);
        };

        const handleClickMore = () => {
            setMoreModalState.visible = true;
        };

        const handleSetMoreModalConfirm = () => {
            setMoreModalState.visible = false;
        };

        return {
            ...toRefs(state),
            setMoreModalState,
            handleClickMore,
            handleSelectGroupByItems,
            handleSetMoreModalConfirm,
            predicate,
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
        .group-by-button {
            margin-left: 0.375rem;
            &:first-of-type {
                margin-left: 0;
            }
        }
    }
}
</style>
