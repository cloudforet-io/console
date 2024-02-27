<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToggleButton } from '@spaceone/design-system';

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
    isToggleActive: false,
    toggleStatus: computed(() => state.filters[props.type].length > 0 || state.isToggleActive),
    filters: computed(() => cloudServicePageState.additionalFilters),
});

const handleFilterUpdate = (name: string, selected: string[]) => {
    cloudServicePageStore.$patch((_state) => {
        _state.additionalFilters = { ...state.filters, [name]: selected };
    });
};
const handleChangeToggle = (value: boolean) => {
    state.isToggleActive = value;
    if (!state.isToggleActive) {
        cloudServicePageStore.$patch((_state) => {
            _state.additionalFilters = { ...state.filters, [props.type]: [] };
        });
    }
};
</script>

<template>
    <div class="asset-inventory-l-s-b-toggle-menu-item">
        <div class="toggle-title">
            <span>{{ props.label }}</span>
            <p-toggle-button :value="state.toggleStatus"
                             class="toggle-button"
                             @change-toggle="handleChangeToggle"
            />
        </div>
        <div v-if="state.toggleStatus"
             class="toggle-contents"
        >
            <cloud-service-filter-search-dropdown :type="props.type"
                                                  :selected="state.filters[props.type]"
                                                  @click-done="handleFilterUpdate(props.type, $event)"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.asset-inventory-l-s-b-toggle-menu-item {
    @apply flex flex-col text-label-md;
    padding-bottom: 0.5rem;
    flex: 1;
    .toggle-title {
        @apply flex justify-between font-bold;
    }
    .toggle-contents {
        margin-top: 0.5rem;
    }
}
</style>
