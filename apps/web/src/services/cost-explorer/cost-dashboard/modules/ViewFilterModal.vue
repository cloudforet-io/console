<script lang="ts" setup>
import {
    PButtonModal, PEmpty,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useProxyValue } from '@/common/composables/proxy-state';

import { FILTER, FILTER_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import CostExplorerFilterTags from '@/services/cost-explorer/modules/CostExplorerFilterTags.vue';
import type { CostFiltersMap } from '@/services/cost-explorer/type';


const DASHBOARD_FILTERS = [FILTER.PROJECT_GROUP, FILTER.PROJECT, FILTER.SERVICE_ACCOUNT, FILTER.PROVIDER];
const CUSTOM_DASHBOARD_FILTERS = Object.values(FILTER);

interface Props {
    visible: boolean;
    selectedFilters: CostFiltersMap;
    isCustom?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    selectedFilters: () => ({}),
    isCustom: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    categories: computed(() => (props.isCustom ? CUSTOM_DASHBOARD_FILTERS : DASHBOARD_FILTERS)),
});

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/serviceAccount/load'),
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
    ]);
})();

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="view-filter-modal"
        :header-title="t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER')"
        fade
        backdrop
        hide-footer-confirm-button
    >
        <template #body>
            <div v-for="category in state.categories"
                 :key="`filter-wrapper-${category}`"
                 class="filter-wrapper"
            >
                <p class="title">
                    {{ FILTER_ITEM_MAP[category].label }} ({{ selectedFilters[category] ? selectedFilters[category].length : 0 }})
                </p>
                <cost-explorer-filter-tags :filters="{ [category]: selectedFilters[category] ? selectedFilters[category] : [] }"
                                           hide-category
                >
                    <template #no-filter>
                        <p-empty>
                            {{ t('BILLING.COST_MANAGEMENT.MAIN.NO_SELECTED_FILTER') }}
                        </p-empty>
                    </template>
                </cost-explorer-filter-tags>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-button-modal */
.view-filter-modal {
    :deep(.modal-body) {
        max-height: 20rem;
    }
}

.filter-wrapper {
    margin-bottom: 1.5rem;
    .title {
        margin-bottom: 1rem;
    }
    .p-empty {
        @apply justify-start ;
        font-size: 0.875rem;
    }
    .filters {
        @apply flex flex-wrap;
        gap: 0.5rem;
    }
}
</style>
