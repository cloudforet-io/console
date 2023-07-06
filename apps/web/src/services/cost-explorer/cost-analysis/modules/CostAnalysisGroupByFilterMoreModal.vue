<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFilterableDropdown, PFieldGroup,
} from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { FILTER, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { MoreGroupByItem } from '@/services/cost-explorer/type';


interface Props {
    visible: boolean;
    headerTitle: string;
    prevMoreGroupByItems: MoreGroupByItem[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    headerTitle: '',
    prevMoreGroupByItems: () => [],
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const { t } = useI18n();

const costAnalysisPageStore = useCostAnalysisPageStore();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    selectedAdditionalInfo: [] as SelectDropdownMenu[],
    selectedTags: [] as SelectDropdownMenu[],
});

/* Api */
let resourceToken: CancelTokenSource | undefined;
const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|void> => {
    if (resourceToken) {
        resourceToken.cancel('Next request has been called.');
        resourceToken = undefined;
    }

    resourceToken = axios.CancelToken.source();

    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: 'cost_analysis.Cost',
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
            },
        }, {
            cancelToken: resourceToken.token,
        });
        resourceToken = undefined;

        return results;
    } catch (e: any) {
        if (!axios.isCancel(e.axiosError)) {
            ErrorHandler.handleError(e);
        }

        return undefined;
    } finally {
        state.loading = false;
    }
};
const tagsMenuHandler: AutocompleteHandler = async (value: string) => {
    const results = await getResources(value, FILTER.TAGS);
    return { results: results ? results.map((d) => ({ name: d.key, label: d.name })) : [] };
};
const additionalInfoMenuHandler: AutocompleteHandler = async (value: string) => {
    const results = await getResources(value, FILTER.ADDITIONAL_INFO);
    return { results: results ? results.map((d) => ({ name: d.key, label: d.name })) : [] };
};

/* Event */
const handleConfirm = () => {
    const preMoreGroupBy = costAnalysisPageStore.orderedMoreGroupByItems;
    const tagsGroupBy: MoreGroupByItem[] = state.selectedTags.map((d) => ({
        category: MORE_GROUP_BY.TAGS,
        key: d.name as string,
    }));
    const additionalInfoGroupBy: MoreGroupByItem[] = state.selectedAdditionalInfo.map((d) => ({
        category: MORE_GROUP_BY.ADDITIONAL_INFO,
        key: d.name as string,
    }));
    const updatedMoreGroupBy = tagsGroupBy.concat(additionalInfoGroupBy);

    // use previous data if the selected item already exists(because of `selected`, `disabled` properties)
    const mergedMoreGroupBy: MoreGroupByItem[] = [];
    updatedMoreGroupBy.forEach((item) => {
        const _selected = preMoreGroupBy.find((d) => d.category === item.category && d.key === item.key);
        if (_selected) mergedMoreGroupBy.push(_selected);
        else mergedMoreGroupBy.push(item);
    });
    state.proxyVisible = false;
    costAnalysisPageStore.setMoreGroupByWithSettings(mergedMoreGroupBy);
};

/* Watcher */
watch(() => props.visible, (visible) => {
    if (visible) {
        state.selectedTags = props.prevMoreGroupByItems?.filter((d) => d.category === MORE_GROUP_BY.TAGS).map((d) => ({
            name: d.key, label: d.key,
        }));
        state.selectedAdditionalInfo = props.prevMoreGroupByItems?.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO).map((d) => ({
            name: d.key, label: d.key,
        }));
    }
}, { immediate: true });

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="cost-analysis-group-by-filter-more-modal"
        :header-title="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADD_MORE')"
        size="sm"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LABEL_TAG')"
                           required
            >
                <template #label-extra>
                    <span class="font-normal">({{ state.selectedTags.length }})</span>
                </template>
                <p-filterable-dropdown
                    v-model:selected="state.selectedTags"
                    :handler="tagsMenuHandler"
                    use-fixed-menu-style
                    multi-selectable
                    appearance-type="stack"
                    show-select-marker
                />
            </p-field-group>
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADDITIONAL_INFO')"
                           required
            >
                <template #label-extra>
                    <span class="font-normal">({{ state.selectedAdditionalInfo.length }})</span>
                </template>
                <p-filterable-dropdown
                    v-model:selected="state.selectedAdditionalInfo"
                    :handler="additionalInfoMenuHandler"
                    use-fixed-menu-style
                    multi-selectable
                    appearance-type="stack"
                    show-select-marker
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>
