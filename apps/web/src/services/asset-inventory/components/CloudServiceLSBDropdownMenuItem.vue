<script setup lang="ts">
import { computed, reactive } from 'vue';

import CloudServiceFilterSearchDropdown
    from '@/services/asset-inventory/components/CloudServiceFilterSearchDropdown.vue';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';

interface Props {
    type: string;
    label: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: '' as string,
    label: '' as string,
});

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const state = reactive({
    filters: computed(() => cloudServicePageState.additionalFilters),
});

const handleFilterUpdate = (name: string, selected: string[]) => {
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
