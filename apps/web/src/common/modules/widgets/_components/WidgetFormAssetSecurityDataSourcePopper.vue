<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PFieldTitle, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { sortBy } from 'lodash';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    dataSourceDomain: string;
    selectedMetricId?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:selected-metric-id', metricId: string): void;
}>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
});
const state = reactive({
    proxySelectedMetricId: useProxyValue('selectedMetricId', props, emit),
    // category
    categoryMenuItems: computed<MenuItem[]>(() => {
        const groups = Object.values(storeState.namespaces)
            .filter((d) => d.data.category === props.dataSourceDomain)
            .map((namespace) => namespace.data.group);
        const _groupMenuItems: MenuItem[] = [];
        const _uniqueGroups = Array.from(new Set(groups));
        sortBy(_uniqueGroups, (group) => group !== 'common').forEach((group) => {
            if (group === 'common') {
                _groupMenuItems.push({
                    type: 'item',
                    name: group,
                    label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON'),
                });
            } else {
                // provider case
                const providerData = storeState.providers[group];
                if (providerData) {
                    _groupMenuItems.push({
                        type: 'item',
                        name: providerData.key,
                        label: providerData.label,
                        imageUrl: providerData.data.icon,
                    });
                }
            }
        });
        return _groupMenuItems.filter((d) => d.label.toLowerCase().includes(state.categorySearchText.toLowerCase()));
    }),
    categorySearchText: '',
    selectedCategory: undefined as undefined|string,
    // namespace
    namespaceMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedCategory) return [];
        return Object.values(storeState.namespaces)
            .filter((d) => d.data.category === props.dataSourceDomain)
            .filter((d) => d.data.group === state.selectedCategory)
            .filter((d) => d.label.toLowerCase().includes(state.namespaceSearchText.toLowerCase()))
            .map((namespace) => ({
                type: 'item',
                name: namespace.key,
                label: namespace.label,
                imageUrl: namespace.data?.icon,
            }));
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
});

/* Event */
const handleSelectCategory = (item: MenuItem) => {
    state.selectedCategory = item.name;
    state.selectedNamespaceId = undefined;
    state.proxySelectedMetricId = undefined;
};
const handleSelectNamespace = (item: MenuItem) => {
    state.selectedNamespaceId = item.name;
    state.proxySelectedMetricId = undefined;
};
const handleSelectMetric = (item: MenuItem) => {
    state.proxySelectedMetricId = item.name;
};
</script>

<template>
    <div class="widget-form-asset-security-data-source-popper">
        <div class="data-source-select-col">
            <p-field-title class="field-title"
                           :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY')"
                           required
            />
            <p-context-menu :menu="state.categoryMenuItems"
                            :search-text.sync="state.categorySearchText"
                            searchable
                            @select="handleSelectCategory"
            >
                <template #item--format="{ item }">
                    <div v-if="item.name === 'common'"
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
            <p-field-title class="field-title"
                           :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.NAMESPACE')"
                           required
            />
            <p-context-menu :menu="state.namespaceMenuItems"
                            :search-text.sync="state.namespaceSearchText"
                            searchable
                            @select="handleSelectNamespace"
            />
        </div>
        <div class="data-source-select-col">
            <p-field-title class="field-title"
                           :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.METRIC')"
                           required
            />
            <p-context-menu :menu="state.metricMenuItems"
                            :search-text.sync="state.metricSearchText"
                            searchable
                            @select="handleSelectMetric"
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
