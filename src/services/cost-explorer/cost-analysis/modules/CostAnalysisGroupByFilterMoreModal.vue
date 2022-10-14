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
                    :selected="selectedTags"
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
                    :selected="selectedAdditionalInfo"
                    use-fixed-menu-style
                    multi-selectable
                    :placeholder="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SEARCH_PLACEHOLDER')"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import {
    PButtonModal, PSearchDropdown, PFieldGroup,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/dist/src/inputs/dropdown/select-dropdown/type';

import { useProxyValue } from '@/common/composables/proxy-state';


export default {
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
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            additionalInfoItems: [
                { name: '14a565a8-d519-434e-abdd-cebf367a1a78', label: 'channels' },
                { name: '14a565a8-d519-434e-abdd-cebf367a1c78', label: 'Internal' },
            ] as SelectDropdownMenu[],
            selectedAdditionalInfo: [],
            tagItems: [
                { name: 'sample_tag', label: 'Sample Tag' },
            ] as SelectDropdownMenu[],
            selectedTags: [
                { name: 'sample_tag', label: 'Sample Tag' },
            ],
        });

        /* Event */
        const handleConfirm = () => {
            state.proxyVisible = false;
        };

        return {
            ...toRefs(state),
            handleConfirm,
        };
    },
};
</script>
