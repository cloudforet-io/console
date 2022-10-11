<template>
    <div class="cost-analysis-group-by-filter-more">
        <p-select-button v-for="moreGroupByItem in moreGroupByItems"
                         :key="moreGroupByItem.name"
                         :value="moreGroupByItem"
                         :selected="selectedMoreGroupByItems"
                         multi-selectable
                         size="sm"
                         :predicate="predicate"
                         @change="handleSelectGroupByItems"
        >
            {{ moreGroupByItem.label }}
        </p-select-button>
        <p-popover position="bottom-end" :is-visible.sync="popoverVisible">
            <p-icon-button name="ic_setting" size="sm" style-type="transparent"
                           @click="handleClickSettingButton"
            />
            <template #content>
                <div class="popover-content-wrapper">
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Default') }}</b>
                        <span class="count-text"> ({{ count.default }})</span>
                    </div>
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Tags') }}</b>
                        <span class="count-text"> ({{ count.tags }})</span>
                    </div>
                    <div class="group-by-wrapper">
                        <!--    song-lang-->
                        <b>{{ $t('Additional Info') }}</b>
                        <span class="count-text"> ({{ count.additionalInfo }})</span>
                    </div>
                    <p-button icon="ic_plus_bold" style-type="primary1" :outline="true"
                              @click="handleClickAddMoreButton"
                    >
                        <!--    song-lang-->
                        {{ $t('Add More') }}
                    </p-button>
                </div>
            </template>
        </p-popover>
        <cost-analysis-group-by-filter-more-modal :visible.sync="addMoreModalVisible" />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PIconButton, PPopover, PButton, PSelectButton,
} from '@spaceone/design-system';

import CostAnalysisGroupByFilterMoreModal from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilterMoreModal.vue';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import type { GroupByItem } from '@/services/cost-explorer/store/cost-analysis/type';
import type { CostQueryFilters } from '@/services/cost-explorer/type';


const SAMPLE_FILTERS: CostQueryFilters = {
    tags: [
        'name', 'team',
        // { name: 'name', label: 'Sample Tag' },
        // { name: 'team', label: 'Team', disabled: true },
    ],
    additional_info: [
        'raw_usage_type',
        // { name: 'raw_usage_type', label: 'sample_sample' },
    ],
};
export default defineComponent({
    name: 'CostAnalysisGroupByFilterMore',
    components: {
        CostAnalysisGroupByFilterMoreModal,
        PIconButton,
        PPopover,
        PButton,
        PSelectButton,
    },
    props: {
    },
    setup() {
        const state = reactive({
            popoverVisible: false,
            moreGroupByItems: computed<GroupByItem[]>(() => {
                const results: GroupByItem[] = [];
                Object.values(SAMPLE_FILTERS).forEach((v) => {
                    results.push(...v.map(d => ({ name: d, label: d })));
                });
                return results;
            }),
            selectedMoreGroupByItems: [] as GroupByItem[],
            count: {
                default: Object.keys(GROUP_BY).length,
                tags: 0,
                additionalInfo: 0,
            },
            addMoreModalVisible: false,
        });

        /* Util */
        const predicate = (current, data) => Object.keys(current).every(key => data && current[key] === data[key]);

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
        const handleSelectGroupByItems = (items: GroupByItem[]) => {
            state.selectedMoreGroupByItems = items;
        };

        return {
            ...toRefs(state),
            predicate,
            handleClickSettingButton,
            handleClose,
            handleClickAddMoreButton,
            handleSelectGroupByItems,
        };
    },
});
</script>
<style lang="postcss">
.cost-analysis-group-by-filter-more {
    display: flex;
    column-gap: 0.375rem;

    /* custom design-system component - p-popover */
    :deep(.p-popover) {
        .popper {
            padding: 0;
        }
    }
    .popover-content-wrapper {
        display: grid;
        gap: 1.25rem;
        padding: 0.875rem 1rem;
        .count-text {
            padding-left: 0.25rem;
        }
    }
}
</style>
