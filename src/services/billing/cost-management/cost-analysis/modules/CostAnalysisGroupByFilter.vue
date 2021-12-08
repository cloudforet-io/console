<template>
    <div class="cost-analysis-group-by-filter">
        <b class="mr-3">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
        <p-select-button v-for="groupByItem in allGroupByItems"
                         :key="groupByItem.name"
                         :value="groupByItem"
                         :selected="selectedGroupByItems"
                         multi-selectable
                         size="sm"
                         :predicate="predicate"
                         @change="handleSelectGroupByItems"
        >
            {{ groupByItem.label }}
        </p-select-button>
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

import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { store } from '@/store';
import { i18n } from '@/translations';
import { GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';

// import CostAnalysisSetMoreModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSetMoreModal.vue';


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
            selectedGroupByItems: computed<GroupByItem[]>(() => store.getters['service/costAnalysis/groupByItems']),
            allGroupByItems: Object.values(GROUP_BY_ITEM_MAP),
            moreGroupBy: [],
        });

        const setMoreModalState = reactive({
            visible: false,
            headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_MORE')),
        });

        /* util */
        const predicate = (current, data) => Object.keys(current).every(key => data && current[key] === data[key]);

        /* event */
        const handleSelectGroupByItems = async (items: GroupByItem[]) => {
            const groupBy = items.map(d => d.name);
            store.commit('service/costAnalysis/setGroupBy', groupBy);
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
    @apply flex flex-wrap bg-white rounded-md border border-gray-200;
    column-gap: 0.375rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem;
    margin-bottom: 1rem;
}
</style>
