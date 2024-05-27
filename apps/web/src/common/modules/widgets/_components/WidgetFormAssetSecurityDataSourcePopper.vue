<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PButton, PFieldTitle, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';


interface Props {
    dataSourceDomain: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select-metric-id', metricId: string): void;
}>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
});
const state = reactive({
    // category
    categoryMenuItems: computed<MenuItem[]>(() => {
        const _commonMenuItems: MenuItem = {
            type: 'item',
            name: 'COMMON',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON'),
        };
        const _providerMenuItems: MenuItem[] = [];
        const _providers: string[] = Object.values(storeState.namespaces)
            .filter((namespace) => namespace.data.category === props.dataSourceDomain)
            .map((namespace) => namespace.provider);
        const _uniqueProviders = Array.from(new Set(_providers));
        _uniqueProviders.forEach((provider) => {
            const providerData = storeState.providers[provider];
            _providerMenuItems.push({
                type: 'item',
                name: providerData.key,
                label: providerData.label,
                imageUrl: providerData.data.icon,
            });
        });
        return [_commonMenuItems, ..._providerMenuItems];
    }),
    selectedCategory: undefined as undefined|string,
    // namespace
    namespaceMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedCategory) return [];
        if (state.selectedCategory === 'COMMON') {
            return Object.values(storeState.namespaces)
                .filter((namespace) => namespace.data.category === 'COMMON')
                .filter((namespace) => namespace.label.toLowerCase().includes(state.namespaceSearchText.toLowerCase()))
                .map((namespace) => ({
                    type: 'item',
                    name: namespace.key,
                    label: namespace.label,
                    imageUrl: namespace.data.icon,
                }));
        }
        const _namespaceMenuItems: MenuItem[] = [];
        Object.values(storeState.namespaces)
            .filter((namespace) => namespace.data.category === props.dataSourceDomain)
            .filter((namespace) => namespace.label.toLowerCase().includes(state.namespaceSearchText.toLowerCase()))
            .forEach((namespace) => {
                _namespaceMenuItems.push({
                    type: 'item',
                    name: namespace.key,
                    label: namespace.label,
                    imageUrl: namespace.data.icon,
                });
            });
        return _namespaceMenuItems;
    }),
    namespaceSearchText: '',
    selectedNamespaceId: undefined as undefined|string,
    // metric
    metricMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedNamespaceId) return [];
        const _metrics = Object.values(storeState.metrics)
            .filter((metric) => metric.data.namespace_id === state.selectedNamespaceId)
            .filter((metric) => metric.label.toLowerCase().includes(state.metricSearchText.toLowerCase()));
        return _metrics.map((metric) => ({
            type: 'item',
            name: metric.key,
            label: metric.label,
        }));
    }),
    metricSearchText: '',
    selectedMetricId: undefined as undefined|string,
});

/* Event */
const handleSelectCategory = (item: MenuItem) => {
    state.selectedCategory = item.name;
    state.selectedNamespaceId = undefined;
    state.selectedMetricId = undefined;
};
const handleSelectNamespace = (item: MenuItem) => {
    state.selectedNamespaceId = item.name;
    state.selectedMetricId = undefined;
};
const handleSelectMetric = (item: MenuItem) => {
    state.selectedMetricId = item.name;
};
const handleConfirmDataSource = () => {
    emit('select-metric-id', state.selectedMetricId);
};
</script>

<template>
    <div class="data-source-popover-content">
        <div class="top-part">
            <div class="data-source-select-col">
                <p-field-title :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY')"
                               required
                />
                <p-context-menu :menu="state.categoryMenuItems"
                                @select="handleSelectCategory"
                >
                    <template #item--format="{ item }">
                        <div v-if="item.name === 'COMMON'"
                             class="flex gap-1"
                        >
                            <img src="@/assets/images/img_common-asset@2x.png"
                                 alt="common-namespace-image"
                                 class="common-category-image"
                            >
                            {{ item.label }}
                        </div>
                    </template>
                </p-context-menu>
            </div>
            <div class="data-source-select-col">
                <p-field-title :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.NAMESPACE')"
                               required
                />
                <p-context-menu :menu="state.namespaceMenuItems"
                                :search-text.sync="state.namespaceSearchText"
                                searchable
                                @select="handleSelectNamespace"
                />
            </div>
            <div class="data-source-select-col">
                <p-field-title :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.METRIC')"
                               required
                />
                <p-context-menu :menu="state.metricMenuItems"
                                :search-text.sync="state.metricSearchText"
                                searchable
                                @select="handleSelectMetric"
                />
            </div>
        </div>
        <div class="popover-footer">
            <p-button style-type="substitutive"
                      :disabled="!state.selectedMetricId"
                      @click="handleConfirmDataSource"
            >
                {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.data-source-popover-content {
    display: flex;
    flex-direction: column;
    width: 57rem;
    height: 30rem;
    .top-part {
        @apply grid grid-cols-12;
        flex: 1;
        .data-source-select-col {
            @apply col-span-4 border-r border-gray-200;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
            &:last-child {
                @apply border-r-0;
            }
            .common-category-image {
                width: 1rem;
                height: 1rem;
            }
        }
    }
    .popover-footer {
        @apply border-t border-gray-200;
        text-align: right;
        padding: 0.75rem;
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
}
</style>
