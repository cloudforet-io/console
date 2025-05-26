<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    startCase, toLower,
} from 'lodash';

import {
    PLazyImg, PTextHighlighting,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { getReferenceModelMenuHandler, type ReferenceModelMenuHandlerInfo } from '@/query/reference/helpers/reference-model-menu-handler';
import { useMetricReferenceModel } from '@/query/reference/metric/use-metric-reference-model';
import { useNamespaceReferenceModel } from '@/query/reference/namespace/use-namespace-reference-model';
import { useProviderReferenceModel } from '@/query/reference/provider/use-provider-reference-model';
import { i18n } from '@/translations';

import DataSelector from '@/common/components/select/DataSelector.vue';
import { useProxyValue } from '@/common/composables/proxy-state';




interface Props {
    dataSourceDomain: string;
    selectedMetricId?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:selected-metric-id', metricId: string): void;
}>();

const {
    listReferenceQuery: metricListFetcher,
} = useMetricReferenceModel();
const {
    listReferenceQuery: namespaceListFetcher,
    statReferenceQuery: namespaceStatFetcher,
} = useNamespaceReferenceModel();
const {
    referenceMap: providerMap,
} = useProviderReferenceModel();

const state = reactive({
    proxySelectedMetricId: useProxyValue('selectedMetricId', props, emit),
    // category
    categoryMenuHandler: computed<AutocompleteHandler>(() => {
        const referenceModelInfo: ReferenceModelMenuHandlerInfo = {
            fetchFn: namespaceStatFetcher('group'),
        };
        return getReferenceModelMenuHandler([referenceModelInfo], {
            category: props.dataSourceDomain,
        });
    }),
    selectedCategory: undefined as undefined|string,
    categorySearchText: '',
    // namespace
    namespaceMenuHandler: computed<AutocompleteHandler|undefined>(() => {
        if (!state.selectedCategory) return undefined;
        const referenceModelInfo: ReferenceModelMenuHandlerInfo = {
            fetchFn: namespaceListFetcher,
        };
        return getReferenceModelMenuHandler([referenceModelInfo], {
            group: state.selectedCategory,
            category: props.dataSourceDomain,
        });
    }),
    selectedNamespaceId: undefined as undefined|string,
    namespaceSearchText: '',
    // metric
    metricMenuHandler: computed<AutocompleteHandler|undefined>(() => {
        if (!state.selectedNamespaceId) return undefined;
        const referenceModelInfo: ReferenceModelMenuHandlerInfo = {
            fetchFn: metricListFetcher,
        };
        return getReferenceModelMenuHandler([referenceModelInfo], {
            namespace_id: state.selectedNamespaceId,
        });
    }),
});

const customSnakeToTitleCase = (title: string) => startCase(toLower(title.replace(/_/g, ' ')));

/* Event */
const handleSelectCategory = (items: MenuItem[]) => {
    state.selectedCategory = items?.[0]?.name;
    state.selectedNamespaceId = undefined;
    state.proxySelectedMetricId = undefined;
};
const handleUpdateCategorySearchText = (value: string) => {
    state.categorySearchText = value;
};
const handleSelectNamespace = (items: MenuItem[]) => {
    state.selectedNamespaceId = items?.[0]?.name;
    state.proxySelectedMetricId = undefined;
};
const handleUpdateNamespaceSearchText = (value: string) => {
    state.namespaceSearchText = value;
};
const handleSelectMetric = (items: MenuItem[]) => {
    state.proxySelectedMetricId = items?.[0]?.name;
};
</script>

<template>
    <div class="widget-form-asset-security-data-source-popper">
        <div class="data-source-select-col">
            <data-selector :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY')"
                           :handler="state.categoryMenuHandler"
                           @update:selected="handleSelectCategory"
                           @update:search-text="handleUpdateCategorySearchText"
            >
                <template #menu-item--format="{ item }">
                    <div v-if="item.name === 'common'"
                         class="flex gap-1"
                    >
                        <img src="@/assets/images/img_common-asset@2x.png"
                             alt="common-namespace-image"
                             class="common-category-image"
                        >
                        <p-text-highlighting :text="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON')"
                                             :term="state.categorySearchText"
                                             style-type="secondary"
                        />
                    </div>
                    <div v-else
                         class="flex gap-1"
                    >
                        <p-lazy-img :src="providerMap?.[item.name]?.data?.icon"
                                    width="1rem"
                                    height="1rem"
                                    alt="common-namespace-image"
                                    class="common-category-image"
                        />
                        <p-text-highlighting :text="providerMap?.[item.name]?.label || customSnakeToTitleCase(item.name)"
                                             :term="state.categorySearchText"
                                             style-type="secondary"
                        />
                    </div>
                </template>
            </data-selector>
        </div>
        <div class="data-source-select-col">
            <data-selector :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.NAMESPACE')"
                           :handler="state.namespaceMenuHandler"
                           @update:selected="handleSelectNamespace"
                           @update:search-text="handleUpdateNamespaceSearchText"
            >
                <template #menu-item--format="{ item }">
                    <div class="flex gap-1">
                        <p-lazy-img :src="item.data?.icon"
                                    width="1rem"
                                    height="1rem"
                                    alt="common-namespace-image"
                                    class="common-category-image"
                        />
                        <p-text-highlighting :text="item.label"
                                             :term="state.namespaceSearchText"
                                             style-type="secondary"
                        />
                    </div>
                </template>
            </data-selector>
        </div>
        <div class="data-source-select-col">
            <data-selector :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.METRIC')"
                           :handler="state.metricMenuHandler"
                           @update:selected="handleSelectMetric"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.widget-form-asset-security-data-source-popper {
    display: flex;
    width: 48rem;
    flex: 1;
    .data-source-select-col {
        @apply border-r border-gray-200;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 16rem;
        padding: 0.75rem 0;
        .field-title {
            padding: 0 0.75rem;
        }
        &:last-child {
            @apply border-r-0;
        }
        .common-category-image {
            width: 1rem;
            height: 1rem;
        }
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
}
</style>
