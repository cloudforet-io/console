<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { startCase, toLower } from 'lodash';


import { PLazyImg } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
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

const allReferenceDataModel = useAllReferenceDataModel();
const providerMap = allReferenceDataModel.provider;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();
const state = reactive({
    proxySelectedMetricId: useProxyValue('selectedMetricId', props, emit),
    // category
    categoryMenuHandler: computed(() => resourceMenuHandlerMap.namespace({
        dataKey: 'group',
        menuFilters: [{
            k: 'category',
            v: props.dataSourceDomain,
            o: '=',
        }],
    })),
    categorySearchText: '',
    selectedCategory: undefined as undefined|string,
    // namespace
    namespaceMenuHandler: computed(() => (state.selectedCategory ? resourceMenuHandlerMap.namespace({
        menuFilters: [{
            k: 'group',
            v: state.selectedCategory,
            o: '=',
        }],
    }) : undefined)),
    namespaceSearchText: '',
    selectedNamespaceId: undefined as undefined|string,
    // metric
    metricMenuHandler: computed(() => (state.selectedNamespaceId ? resourceMenuHandlerMap.metric({
        menuFilters: [{
            k: 'namespace_id',
            v: state.selectedNamespaceId,
            o: '=',
        }],
    }) : undefined)),
    metricSearchText: '',
});

const customSnakeToTitleCase = (title: string) => startCase(toLower(title.replace(/_/g, ' ')));


/* Event */
const handleSelectCategory = (item: MenuItem[]) => {
    if (!item.length) return;
    state.selectedCategory = item[0]?.name;
    state.selectedNamespaceId = undefined;
    state.proxySelectedMetricId = undefined;
};
const handleSelectNamespace = (item: MenuItem[]) => {
    if (!item.length) return;
    state.selectedNamespaceId = item[0]?.name;
    state.proxySelectedMetricId = undefined;
};
const handleSelectMetric = (item: MenuItem[]) => {
    if (!item.length) return;
    state.proxySelectedMetricId = item[0]?.name;
};
</script>

<template>
    <div class="widget-form-asset-security-data-source-popper">
        <div class="data-source-select-col">
            <data-selector :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY')"
                           :handler="state.categoryMenuHandler"
                           @update:selected="handleSelectCategory"
            >
                <template #menu-item--format="{item}">
                    <div v-if="item.name === 'common'"
                         class="flex gap-1"
                    >
                        <img src="@/assets/images/img_common-asset@2x.png"
                             alt="common-namespace-image"
                             class="category-image"
                        >
                        {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON') }}
                    </div>
                    <div v-else
                         class="inline-flex gap-1"
                    >
                        <p-lazy-img :src="providerMap[item.name]?.data?.icon"
                                    :alt="item.label"
                                    width="1rem"
                                    height="1rem"
                                    class="category-image"
                        />
                        {{ providerMap[item.name]?.label || customSnakeToTitleCase(item.name) }}
                    </div>
                </template>
            </data-selector>
        </div>
        <div class="data-source-select-col">
            <data-selector :key="state.selectedCategory"
                           :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.NAMESPACE')"
                           :handler="state.namespaceMenuHandler"
                           @update:selected="handleSelectNamespace"
            >
                <template #menu-item--format="{item}">
                    <div class="inline-flex gap-1">
                        <img v-if="item.data.group === 'common'"
                             src="@/assets/images/img_common-asset@2x.png"
                             alt="common-namespace-image"
                             class="category-image"
                        >
                        <p-lazy-img v-else
                                    :src="item.data?.icon"
                                    :alt="item.label"
                                    width="1rem"
                                    height="1rem"
                                    class="category-image"
                        />
                        {{ item.label }}
                    </div>
                </template>
            </data-selector>
        </div>
        <div class="data-source-select-col">
            <data-selector :key="state.selectedNamespaceId"
                           :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.METRIC')"
                           :handler="state.selectedNamespaceId ? state.metricMenuHandler : undefined"
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
        &:last-child {
            @apply border-r-0;
        }
        .category-image {
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
