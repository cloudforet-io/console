<template>
    <div class="cost-analysis-group-by-filter-more">
        <template v-for="(moreGroupByItem, idx) in moreGroupByItems">
            <p-select-button v-if="!moreGroupByItem.disabled"
                             :key="`more-group-by-${moreGroupByItem.key}-${idx}`"
                             :value="moreGroupByItem"
                             :selected="printMode ? '' : moreGroupByItems.filter(d => d.selected)"
                             multi-selectable
                             size="sm"
                             :predicate="predicate"
                             @change="handleSelectMoreGroupByItem(moreGroupByItem, ...arguments)"
            >
                {{ moreGroupByItem.key }}
            </p-select-button>
        </template>
        <p-popover position="bottom-end"
                   :is-visible.sync="popoverVisible"
        >
            <p-icon-button name="ic_setting"
                           size="sm"
                           style-type="transparent"
                           @click="handleClickSettingButton"
            />
            <template #content>
                <div class="popover-content-wrapper">
                    <div v-for="(popoverItem, idx) in popoverItems"
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
                            <p-check-box :selected="!item.disabled"
                                         @change="handleChangeCheckBox(item, ...arguments)"
                            >
                                {{ item.key }}
                            </p-check-box>
                            <p-icon-button name="ic_trashcan"
                                           size="sm"
                                           @click="handleDeleteItem(item)"
                            />
                        </div>
                    </div>
                    <p-button icon="ic_plus_bold"
                              style-type="secondary"
                              @click="handleClickAddMoreButton"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADD_MORE') }}
                    </p-button>
                </div>
            </template>
        </p-popover>
        <cost-analysis-group-by-filter-more-modal :visible.sync="addMoreModalVisible"
                                                  :prev-more-group-by-items="moreGroupByItems"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PIconButton, PPopover, PButton, PSelectButton, PCheckBox,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import CostAnalysisGroupByFilterMoreModal from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilterMoreModal.vue';
import { MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { MoreGroupByItem } from '@/services/cost-explorer/type';

export default defineComponent({
    name: 'CostAnalysisGroupByFilterMore',
    components: {
        CostAnalysisGroupByFilterMoreModal,
        PIconButton,
        PPopover,
        PButton,
        PSelectButton,
        PCheckBox,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            moreGroupByItems: computed<MoreGroupByItem[]>(() => costExplorerStore.getters['costAnalysis/orderedMoreGroupByItems']),
            addMoreModalVisible: false,
            // popover
            popoverVisible: false,
            popoverItems: computed(() => ([
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TAGS'),
                    count: state.tagsGroupByItems.length,
                    items: state.tagsGroupByItems,
                },
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADDITIONAL_INFO'),
                    count: state.additionalInfoGroupByItems.length,
                    items: state.additionalInfoGroupByItems,
                },
            ])),
            tagsGroupByItems: computed(() => state.moreGroupByItems.filter((d) => d.category === MORE_GROUP_BY.TAGS)),
            additionalInfoGroupByItems: computed(() => state.moreGroupByItems.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO)),
        });

        /* Util */
        const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);

        /* Event */
        const handleClickSettingButton = () => {
            state.popoverVisible = !state.popoverVisible;
        };
        const handleClose = () => {
            state.popoverVisible = false;
        };
        const handleClickAddMoreButton = () => {
            state.addMoreModalVisible = true;
        };
        const handleSelectMoreGroupByItem = (item: MoreGroupByItem, _, val) => {
            const _moreGroupBy: MoreGroupByItem[] = cloneDeep(state.moreGroupByItems);
            const target = _moreGroupBy.find((d) => d.category === item.category && d.key === item.key);
            if (target) {
                target.selected = val;
                costExplorerStore.dispatch('costAnalysis/setMoreGroupBy', _moreGroupBy);
            }
        };
        const handleChangeCheckBox = (item: MoreGroupByItem, val) => {
            const _moreGroupBy: MoreGroupByItem[] = cloneDeep(state.moreGroupByItems);
            const target = _moreGroupBy.find((d) => d.category === item.category && d.key === item.key);
            if (target) {
                target.disabled = !val;
                if (!val) target.selected = false;
                costExplorerStore.dispatch('costAnalysis/setMoreGroupBy', _moreGroupBy);
            }
        };
        const handleDeleteItem = (item: MoreGroupByItem) => {
            const _moreGroupBy: MoreGroupByItem[] = cloneDeep(state.moreGroupByItems);
            const targetIdx = _moreGroupBy.findIndex((d) => d.category === item.category && d.key === item.key);
            _moreGroupBy.splice(targetIdx, 1);
            costExplorerStore.dispatch('costAnalysis/setMoreGroupBy', _moreGroupBy);
        };

        return {
            ...toRefs(state),
            predicate,
            handleClickSettingButton,
            handleClose,
            handleClickAddMoreButton,
            handleSelectMoreGroupByItem,
            handleChangeCheckBox,
            handleDeleteItem,
        };
    },
});
</script>
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
