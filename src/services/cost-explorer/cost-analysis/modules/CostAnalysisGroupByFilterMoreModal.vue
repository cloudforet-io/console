<template>
    <p-button-modal
        class="cost-analysis-group-by-filter-more-modal"
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADD_MORE')"
        :visible.sync="proxyVisible"
        size="sm"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_TAG')" required>
                <template #label-extra>
                    <span>({{ selectedTags.length }})</span>
                </template>
                <p-search-dropdown
                    :menu="tagItems"
                    :selected.sync="selectedTags"
                    use-fixed-menu-style
                    multi-selectable
                    :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SEARCH_PLACEHOLDER')"
                />
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_ADDITIONAL_FIELD')" required>
                <template #label-extra>
                    <span>({{ selectedAdditionalInfo.length }})</span>
                </template>
                <p-search-dropdown
                    :menu="additionalInfoItems"
                    :selected.sync="selectedAdditionalInfo"
                    use-fixed-menu-style
                    multi-selectable
                    :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SEARCH_PLACEHOLDER')"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PSearchDropdown, PFieldGroup,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/dist/src/inputs/dropdown/select-dropdown/type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { MoreGroupByItem } from '@/services/cost-explorer/type';


interface Props {
    visible: boolean;
    headerTitle: string;
    prevMoreGroupByItems: MoreGroupByItem[];
}

export default defineComponent<Props>({
    name: 'CostAnalysisGroupByFilterMoreModal',
    components: {
        PFieldGroup,
        PButtonModal,
        PSearchDropdown,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: '',
        },
        prevMoreGroupByItems: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            additionalInfoItems: [
                { name: 'additional_info_sample', label: 'additional_info_sample' },
                { name: 'additional_info_sample2', label: 'additional_info_sample2' },
            ] as SelectDropdownMenu[],
            selectedAdditionalInfo: [] as SelectDropdownMenu[],
            tagItems: [
                { name: 'tag_sample', label: 'tag_sample' },
                { name: 'tag_sample2', label: 'tag_sample2' },
            ] as SelectDropdownMenu[],
            selectedTags: [] as SelectDropdownMenu[],
        });

        /* Event */
        const handleConfirm = () => {
            const tagsGroupBy: MoreGroupByItem[] = state.selectedTags.map(d => ({
                category: MORE_GROUP_BY.TAGS,
                key: d.name,
            }));
            const additionalInfoGroupBy = state.selectedAdditionalInfo.map(d => ({
                category: MORE_GROUP_BY.ADDITIONAL_INFO,
                key: d.name,
            }));
            state.proxyVisible = false;
            costExplorerStore.commit('costAnalysis/setMoreGroupBy', [
                ...tagsGroupBy,
                ...additionalInfoGroupBy,
            ]);
        };

        /* Watcher */
        watch(() => props.visible, (visible) => {
            if (visible) {
                state.selectedTags = props.prevMoreGroupByItems?.filter(d => d.category === MORE_GROUP_BY.TAGS).map(d => ({
                    name: d.key, label: d.key,
                }));
                state.selectedAdditionalInfo = props.prevMoreGroupByItems?.filter(d => d.category === MORE_GROUP_BY.ADDITIONAL_INFO).map(d => ({
                    name: d.key, label: d.key,
                }));
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleConfirm,
        };
    },
});
</script>
