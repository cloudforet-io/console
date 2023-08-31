<script lang="ts" setup>
import {
    PIconButton, PPopover, PButton, PSelectButton, PCheckbox,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import CostAnalysisGroupByFilterMoreModal from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilterMoreModal.vue';
import { MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { MoreGroupByItem } from '@/services/cost-explorer/type';


const costAnalysisPageStore = useCostAnalysisPageStore();

const { t } = useI18n();

const state = reactive({
    addMoreModalVisible: false,
    // popover
    popoverVisible: false,
    popoverItems: computed(() => ([
        {
            title: t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TAGS'),
            count: state.tagsGroupByItems.length,
            items: state.tagsGroupByItems,
        },
        {
            title: t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADDITIONAL_INFO'),
            count: state.additionalInfoGroupByItems.length,
            items: state.additionalInfoGroupByItems,
        },
    ])),
    tagsGroupByItems: computed(() => costAnalysisPageStore.orderedMoreGroupByItems.filter((d) => d.category === MORE_GROUP_BY.TAGS)),
    additionalInfoGroupByItems: computed(() => costAnalysisPageStore.orderedMoreGroupByItems.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO)),
});

/* Util */
const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);

/* Event */
const handleClickSettingButton = () => {
    state.popoverVisible = !state.popoverVisible;
};
const handleClickAddMoreButton = () => {
    state.addMoreModalVisible = true;
};
const handleSelectMoreGroupByItem = (item: MoreGroupByItem, _, val) => {
    const _moreGroupBy: MoreGroupByItem[] = cloneDeep(costAnalysisPageStore.orderedMoreGroupByItems);
    const target = _moreGroupBy.find((d) => d.category === item.category && d.key === item.key);
    if (target) {
        target.selected = val;
        costAnalysisPageStore.setMoreGroupByWithSettings(_moreGroupBy);
    }
};
const handleChangeCheckBox = (item: MoreGroupByItem, val) => {
    const _moreGroupBy: MoreGroupByItem[] = cloneDeep(costAnalysisPageStore.orderedMoreGroupByItems);
    const target = _moreGroupBy.find((d) => d.category === item.category && d.key === item.key);
    if (target) {
        target.disabled = !val;
        if (!val) target.selected = false;
        costAnalysisPageStore.setMoreGroupByWithSettings(_moreGroupBy);
    }
};
const handleDeleteItem = (item: MoreGroupByItem) => {
    const _moreGroupBy: MoreGroupByItem[] = cloneDeep(costAnalysisPageStore.orderedMoreGroupByItems);
    const targetIdx = _moreGroupBy.findIndex((d) => d.category === item.category && d.key === item.key);
    _moreGroupBy.splice(targetIdx, 1);
    costAnalysisPageStore.setMoreGroupByWithSettings(_moreGroupBy);
};
</script>

<template>
    <div class="cost-analysis-group-by-filter-more">
        <template v-for="(moreGroupByItem, idx) in costAnalysisPageStore.orderedMoreGroupByItems"
                  :key="`more-group-by-${moreGroupByItem.key}-${idx}`"
        >
            <p-select-button v-if="!moreGroupByItem.disabled"
                             :value="moreGroupByItem"
                             :selected="costAnalysisPageStore.orderedMoreGroupByItems.filter(d => d.selected)"
                             multi-selectable
                             size="sm"
                             :predicate="predicate"
                             @change="handleSelectMoreGroupByItem(moreGroupByItem, ...arguments)"
            >
                {{ moreGroupByItem.key }}
            </p-select-button>
        </template>
        <p-popover v-model:is-visible="state.popoverVisible"
                   position="bottom-end"
        >
            <p-icon-button name="ic_settings-filled"
                           size="sm"
                           style-type="transparent"
                           @click="handleClickSettingButton"
            />
            <template #content>
                <div class="popover-content-wrapper">
                    <div v-for="(popoverItem, idx) in state.popoverItems"
                         :key="`popover-row-${idx}-${popoverItem.title}`"
                         class="group-by-wrapper"
                    >
                        <div class="title-wrapper">
                            <b>{{ popoverItem.title }}</b>
                            <span class="count-text"> ({{ popoverItem.count }})</span>
                        </div>
                        <div v-for="(item, pIdx) in popoverItem.items"
                             :key="`tags-${item.key}-${pIdx}`"
                             class="list-item"
                        >
                            <p-checkbox :selected="!item.disabled"
                                        @change="handleChangeCheckBox(item, ...arguments)"
                            >
                                {{ item.key }}
                            </p-checkbox>
                            <p-icon-button name="ic_delete"
                                           size="sm"
                                           @click="handleDeleteItem(item)"
                            />
                        </div>
                    </div>
                    <p-button icon="ic_plus_bold"
                              style-type="secondary"
                              @click="handleClickAddMoreButton"
                    >
                        {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADD_MORE') }}
                    </p-button>
                </div>
            </template>
        </p-popover>
        <cost-analysis-group-by-filter-more-modal v-model:visible="state.addMoreModalVisible"
                                                  :prev-more-group-by-items="costAnalysisPageStore.orderedMoreGroupByItems"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-group-by-filter-more {
    display: flex;
    column-gap: 0.375rem;

    /* custom design-system component - p-popover */
    :deep(.p-popover) {
        > .popper {
            padding: 0;
        }
    }
    .popover-content-wrapper {
        display: grid;
        gap: 1.25rem;
        width: 15rem;
        padding: 0.875rem 0 0.875rem 1rem;
        .title-wrapper {
            margin-bottom: 0.25rem;
            line-height: 1.25;
            .count-text {
                padding-left: 0.25rem;
            }
        }
        .list-item {
            @apply rounded-md;
            display: flex;
            align-items: center;
            height: 1.75rem;

            /* custom design-system component -  p-checkbox */
            :deep(.p-checkbox) {
                display: flex;
                flex-grow: 2;
                gap: 0.25rem;
                padding: 0 0.375rem;
            }

            @media (hover: hover) {
                &:hover {
                    @apply bg-blue-100;
                }
            }
        }
    }
}
</style>
