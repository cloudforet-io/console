<script setup lang="ts">
import { computed, reactive } from 'vue';

import CloudServiceFilterSearchDropdown
    from '@/services/asset-inventory/components/CloudServiceFilterSearchDropdown.vue';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceGlobalFilterMap, CloudServiceFilterMap } from '@/services/asset-inventory/types/cloud-service-page-type';

interface Props {
    type: string;
    label: string;
    isGlobalFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: '' as string,
    label: '' as string,
});

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.state;
const cloudServiceLSBStore = useCloudServiceLSBStore();
const cloudServiceLSBState = cloudServiceLSBStore.state;

const state = reactive({
    filters: computed<CloudServiceFilterMap|CloudServiceGlobalFilterMap>(() => {
        if (props.isGlobalFilter) {
            return cloudServiceLSBState.globalFilters;
        }
        return cloudServicePageState.additionalFilters;
    }),
});

const handleFilterUpdate = (name: string, selected: string[]) => {
    if (props.isGlobalFilter) {
        cloudServiceLSBStore.setGloablFilters({ ...state.filters, [name]: selected } as CloudServiceGlobalFilterMap);
        return;
    }
    cloudServicePageStore.setAdditionalFilters({ ...state.filters, [name]: selected } as CloudServiceFilterMap);
};
</script>

<template>
    <div class="cloud-service-l-s-b-dropdown-menu-item">
        <cloud-service-filter-search-dropdown :type="props.type"
                                              :selected="state.filters[props.type]"
                                              @select="handleFilterUpdate(props.type, $event)"
        />
    </div>
</template>

<style scoped lang="postcss">
.cloud-service-l-s-b-dropdown-menu-item {
    @apply text-label-md;
}
</style>
