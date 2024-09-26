<script setup lang="ts">
import { computed, reactive } from 'vue';

import CloudServiceFilterSearchDropdown
    from '@/services/asset-inventory/components/CloudServiceFilterSearchDropdown.vue';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';

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
const cloudServicePageState = cloudServicePageStore.$state;
const cloudServiceLSBStore = useCloudServiceLSBStore();
const cloudServiceLSBState = cloudServiceLSBStore.$state;

const state = reactive({
    filters: computed(() => {
        if (props.isGlobalFilter) {
            return cloudServiceLSBState.globalFilters;
        }
        return cloudServicePageState.additionalFilters;
    }),
});

const handleFilterUpdate = (name: string, selected: string[]) => {
    if (props.isGlobalFilter) {
        cloudServiceLSBStore.$patch((_state) => {
            _state.globalFilters = { ...state.filters, [name]: selected };
        });
        return;
    }
    cloudServicePageStore.$patch((_state) => {
        _state.additionalFilters = { ...state.filters, [name]: selected };
    });
};
</script>

<template>
    <div class="cloud-service-l-s-b-dropdown-menu-item">
        <cloud-service-filter-search-dropdown :type="props.type"
                                              :selected="state.filters[props.type]"
                                              @click-done="handleFilterUpdate(props.type, $event)"
        />
    </div>
</template>

<style scoped lang="postcss">
.cloud-service-l-s-b-dropdown-menu-item {
    @apply text-label-md;
}
</style>
